const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const { authenticate } = require('../middlewares/auth')

router.post('/register', userController.register)
router.post('/login', userController.login)
router.put('/edit', authenticate, userController.editProfile)
router.put('/changePassword', authenticate, userController.changePassword)

module.exports = router