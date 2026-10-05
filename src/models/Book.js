const mongoose = require('mongoose');
const { readConnection, writeConnection } = require('../config/db');
const { REQUIRED_PREFIX, VAT_RATE } = require('../config/constants');

const bookSchema = new mongoose.Schema({
  bookCode: {
    type: String,
    required: [true, 'Mã sản phẩm không được để trống'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return typeof v === 'string' && v.startsWith(REQUIRED_PREFIX);
      },
      message: props => `Mã sản phẩm (${props.value}) không hợp lệ! Bắt buộc phải có tiền tố là 3 số cuối MSSV: ${REQUIRED_PREFIX}`
    }
  },
  title: {
    type: String,
    required: [true, 'Tên sách không được để trống'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Tác giả không được để trống'],
    trim: true
  },
  category: {
    type: String,
    default: 'Công nghệ',
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Giá gốc không được để trống'],
    min: [0, 'Giá không được âm']
  },
  vatRate: {
    type: Number,
    default: VAT_RATE
  },
  priceWithVAT: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Model phuc vu luong DOC (Su dung Read Connection)
const ReadBookModel = readConnection.model('Book', bookSchema, 'books');

// Model phuc vu luong GHI (Su dung Write Connection)
const WriteBookModel = writeConnection.model('Book', bookSchema, 'books');

module.exports = {
  ReadBookModel,
  WriteBookModel
};
