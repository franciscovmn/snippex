const express = require('express')
const router = express.Router()
const { receiveYampiWebhook } = require('../controllers/yampiController')

router.post('/webhook', receiveYampiWebhook)

module.exports = router
