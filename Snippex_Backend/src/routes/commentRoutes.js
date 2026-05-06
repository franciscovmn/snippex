const express = require('express')
const { authenticate, optionalAuth } = require('../middlewares/auth')

const commentController = require('../controllers/commentController')
const router  = express.Router()

router.get('/snippet/:snippet_id', commentController.getCommentsBySnippet)
router.get('/user/:user_id', commentController.getCommentsByUser)
router.get('/:id', commentController.getCommentsById)

router.post('/', authenticate, commentController.createComment)
router.put('/:id', authenticate, commentController.updateComment)
router.delete('/:id', authenticate, commentController.deleteComment)

module.exports = router