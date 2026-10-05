const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Route DOC danh sach sach (Read Connection)
router.get('/', bookController.getBooks);
router.get('/books', bookController.getBooks);

// Route GHI them sach moi (Write Connection)
router.post('/books', bookController.createBook);

// Route GHI xoa sach (Write Connection)
router.post('/books/delete/:id', bookController.deleteBook);

module.exports = router;
