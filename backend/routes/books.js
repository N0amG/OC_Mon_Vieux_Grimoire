const express = require('express')
const router = express.Router()
const booksCtrl = require('../controllers/books')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

router.post('/', auth, multer, booksCtrl.createOneThing)
router.get('/', booksCtrl.getAllThings)
router.get('/bestrating', booksCtrl.getBestRateThings)
router.post('/:id/rating', auth, booksCtrl.rateOneThing)
router.delete('/:id', auth, booksCtrl.deleteOneThing)
router.get('/:id', booksCtrl.getOneThing)
router.put('/:id', auth, multer, booksCtrl.modifyOneThing)

module.exports = router