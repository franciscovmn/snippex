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

  module.exports = {
    register,
    login
  }