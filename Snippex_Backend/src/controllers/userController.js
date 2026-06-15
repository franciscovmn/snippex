  const bcrypt = require('bcrypt')
  const jwt = require('jsonwebtoken')
  const userRepository = require('../repositories/userRepository')
  const subscriptionRepository = require('../repositories/subscriptionRepository')

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

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          team_id: user.team_id ?? null
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      )

      return res.json({
        token,
        user: serializeUser(user),
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao fazer login' })
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
    getMe,
    cancelSubscriptionRenewal,
    editProfile,
    changePassword
  }
