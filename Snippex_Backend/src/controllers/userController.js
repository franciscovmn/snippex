  const bcrypt = require('bcrypt')
  const jwt = require('jsonwebtoken')
  const userRepository = require('../repositories/userRepository')

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

      return res.status(201).json(user)
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
        user: {
          id: user.id,
          name: user.name,
          user_name: user.user_name,
          email: user.email
        }
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao fazer login' })
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
    editProfile,
    changePassword
  }