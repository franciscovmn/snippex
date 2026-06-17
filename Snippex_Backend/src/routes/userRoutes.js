const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const { authenticate } = require('../middlewares/auth')

router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/supabase-login', userController.supabaseLogin)
router.get('/me', authenticate, userController.getMe)
router.post('/subscription/checkout-intent', authenticate, userController.createCheckoutIntent)
router.put('/subscription/cancel-renewal', authenticate, userController.cancelSubscriptionRenewal)
router.put('/edit', authenticate, userController.editProfile)
router.put('/changePassword', authenticate, userController.changePassword)

module.exports = router
