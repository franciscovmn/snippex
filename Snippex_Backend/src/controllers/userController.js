  const bcrypt = require('bcrypt')
  const crypto = require('crypto')
  const jwt = require('jsonwebtoken')
  const userRepository = require('../repositories/userRepository')
  const subscriptionRepository = require('../repositories/subscriptionRepository')

  const YAMPI_STORE_TOKEN = 'XTTrCEosIxdWmG0qK7zFCsJj4yOOeibRh1IWeCkU'
  const CHECKOUT_URLS = {
    pro: {
      monthly: { tokenReference: '7FX3TUDOCK', productOptionId: '300330119' },
      yearly: { tokenReference: '8NJ0LBGLCX', productOptionId: '300330120' },
    },
    team: {
      monthly: { tokenReference: '1HUSKUIK5H', productOptionId: '300330121' },
      yearly: { tokenReference: 'I0K935D98K', productOptionId: '300330122' },
    },
  }

  function buildCheckoutUrl({ userId, planId, billingCycle }) {
    const checkout = CHECKOUT_URLS[planId]?.[billingCycle]
    if (!checkout) return null

    const params = new URLSearchParams()
    params.append('product_option_id[]', checkout.productOptionId)
    params.append('quantity[]', '1')
    params.set('tokenReference', checkout.tokenReference)
    params.set('metadata[source_platform]', 'snippex')
    params.set('metadata[snippex_user_id]', userId)
    params.set('metadata[snippex_plan_id]', planId)
    params.set('metadata[snippex_billing_cycle]', billingCycle)
    params.set('redirectTo', 'checkout')
    params.set('skipToCheckout', '1')
    params.set('store_token', YAMPI_STORE_TOKEN)
    params.set('clearCart', '1')

    return `https://snippex-ia.pay.yampi.com.br/cart/items?${params.toString()}`
  }

  function serializeUser(user) {
    return {
      id: user.id,
      name: user.name,
      user_name: user.user_name,
      email: user.email,
      subscription: {
        plan_id: user.subscription_plan_id ?? 'free',
        billing_cycle: user.subscription_billing_cycle ?? null,
        status: user.subscription_status ?? 'free',
        checkout_url: user.subscription_checkout_url ?? null,
        cancel_at_period_end: user.subscription_cancel_at_period_end ?? false,
        current_period_end: user.subscription_current_period_end ?? null,
        activated_at: user.subscription_activated_at ?? null,
        canceled_at: user.subscription_canceled_at ?? null,
      },
    }
  }

  function signUserToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        team_id: user.team_id ?? null
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )
  }

  function normalizeUserName(value) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32)
  }

  function buildUserName({ name, email, providerId }) {
    const base = normalizeUserName(name || email.split('@')[0]) || 'user'
    const suffix = providerId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toLowerCase()
    return `${base}-${suffix || crypto.randomBytes(4).toString('hex')}`.slice(0, 48)
  }

  async function fetchSupabaseUser(accessToken) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      const error = new Error('Supabase Auth não configurado')
      error.statusCode = 500
      throw error
    }

    const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = new Error('Token Supabase inválido')
      error.statusCode = 401
      throw error
    }

    return response.json()
  }

  async function register(req, res) {
    try {
      const { name, user_name, email, password } = req.body

      if (!name || !user_name || !email || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos' })
      }

      const userExists = await userRepository.findUserByEmail(email)

      if (userExists) {
        return res.status(400).json({ error: 'E-mail já cadastrado' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await userRepository.createUser({
        name,
        user_name,
        email,
        password: hashedPassword
      })

      await subscriptionRepository.ensureUserSubscription(user.id)
      const createdUser = await userRepository.findUserById(user.id)

      return res.status(201).json(serializeUser(createdUser))
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao cadastrar usuário' })
    }
  }

  async function login(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Preencha e-mail e senha' })
      }

      const user = await userRepository.findUserByEmail(email)

      if (!user) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos' })
      }

      const passwordIsValid = await bcrypt.compare(password, user.password)

      if (!passwordIsValid) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos' })
      }

      const token = signUserToken(user)

      return res.json({
        token,
        user: serializeUser(user),
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao fazer login' })
    }
  }

  async function supabaseLogin(req, res) {
    try {
      const { access_token } = req.body

      if (!access_token) {
        return res.status(400).json({ error: 'Token Supabase é obrigatório' })
      }

      const supabaseUser = await fetchSupabaseUser(access_token)
      const email = supabaseUser.email

      if (!email) {
        return res.status(400).json({ error: 'Conta Google sem e-mail disponível' })
      }

      let user = await userRepository.findUserByEmail(email)

      if (!user) {
        const name = supabaseUser.user_metadata?.full_name
          || supabaseUser.user_metadata?.name
          || email.split('@')[0]

        const password = await bcrypt.hash(crypto.randomUUID(), 10)
        const createdUser = await userRepository.createUser({
          name,
          user_name: buildUserName({ name, email, providerId: supabaseUser.id || email }),
          email,
          password,
        })

        await subscriptionRepository.ensureUserSubscription(createdUser.id)
        user = await userRepository.findUserById(createdUser.id)
      } else {
        await subscriptionRepository.ensureUserSubscription(user.id)
      }

      const token = signUserToken(user)

      return res.json({
        token,
        user: serializeUser(user),
      })
    } catch (error) {
      console.error(error)
      return res.status(error.statusCode || 500).json({
        error: error.statusCode === 401
          ? 'Token Supabase inválido'
          : 'Erro ao fazer login com Google',
      })
    }
  }

  async function getMe(req, res) {
    try {
      const userId = req.user.id
      const user = await userRepository.findUserById(userId)

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      return res.status(200).json({ user: serializeUser(user) })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao carregar usuário' })
    }
  }

  async function cancelSubscriptionRenewal(req, res) {
    try {
      const userId = req.user.id
      const user = await userRepository.findUserById(userId)

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      const status = user.subscription_status ?? 'free'

      if (status === 'free') {
        return res.status(400).json({
          error: 'Esse usuário não possui uma assinatura ativa para cancelar.',
        })
      }

      await subscriptionRepository.ensureUserSubscription(userId)
      await subscriptionRepository.updateSubscriptionForUser(userId, {
        cancel_at_period_end: true,
        status,
      })

      const updatedUser = await userRepository.findUserById(userId)

      return res.status(200).json({
        message: 'Renovação cancelada com sucesso',
        user: serializeUser(updatedUser),
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao cancelar renovação' })
    }
  }

  async function createCheckoutIntent(req, res) {
    try {
      const userId = req.user.id
      const { planId, billingCycle } = req.body
      const checkoutUrl = buildCheckoutUrl({ userId, planId, billingCycle })

      if (!checkoutUrl) {
        return res.status(400).json({
          error: 'Plano ou ciclo de cobrança inválido.',
        })
      }

      const subscription = await subscriptionRepository.upsertCheckoutIntent({
        userId,
        planId,
        billingCycle,
        checkoutUrl,
      })

      return res.status(200).json({
        checkoutUrl,
        subscription,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao preparar checkout.' })
    }
  }

  async function editProfile(req, res) {
    try {
      const { name, user_name, email } = req.body
      const userId = req.user.id // vindo do middleware JWT

      if (!name || !user_name || !email) {
        return res.status(400).json({
          error: 'Preencha todos os campos'
        })
      }

      const userExists = await userRepository.findUserByEmail(email)

      if (userExists && userExists.id !== userId) {
        return res.status(400).json({
          error: 'E-mail já está em uso'
        })
      }

      await userRepository.editProfile({
        id: userId,
        name,
        user_name,
        email
      })

      return res.status(200).json({
        message: 'Perfil atualizado com sucesso'
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        error: 'Erro ao atualizar perfil'
      })
    }
  }

  async function changePassword(req, res) {
    try {
      const { password } = req.body
      const userId = req.user.id // vindo do middleware JWT

      if (!password) {
        return res.status(400).json({
          error: 'Senha é obrigatória'
        })
      }

      // verifica se o usuário existe
      const currentUser = await userRepository.findUserById(userId)

      if (!currentUser) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      await userRepository.changePassword({
        id: userId,
        password: hashedPassword
      })

      return res.status(200).json({
        message: 'Senha atualizada com sucesso'
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        error: 'Erro ao atualizar senha'
      })
    }
  }

  module.exports = {
    register,
    login,
    supabaseLogin,
    getMe,
    createCheckoutIntent,
    cancelSubscriptionRenewal,
    editProfile,
    changePassword
  }
