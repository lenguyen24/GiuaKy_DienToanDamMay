const { ReadBookModel, WriteBookModel } = require('../models/Book');
const { REQUIRED_PREFIX, VAT_RATE, STUDENT_NAME, STUDENT_ID } = require('../config/constants');

// GET / - Xem danh sach sach (Su dung luong DOC - Read Connection)
exports.getBooks = async (req, res) => {
  try {
    // Tang bo dem session (Chung minh Stateless Session hoat dong tren Cloud)
    req.session.visitCount = (req.session.visitCount || 0) + 1;

    // Lay danh sach tu Read Connection
    const books = await ReadBookModel.find().lean().sort({ createdAt: -1 });

    // Tinh toan thong ke
    const totalBooks = books.length;
    const totalValue = books.reduce((sum, book) => sum + (book.priceWithVAT || 0), 0);

    const errorMessage = req.session.errorMessage || null;
    const successMessage = req.session.successMessage || null;
    // Xoa thong bao sau khi doc
    req.session.errorMessage = null;
    req.session.successMessage = null;

    res.render('books', {
      title: 'Quản Lý Sách - Điện Toán Đám Mây',
      books,
      totalBooks,
      totalValue: totalValue.toLocaleString('vi-VN'),
      sessionID: req.sessionID,
      visitCount: req.session.visitCount,
      studentName: STUDENT_NAME,
      studentId: STUDENT_ID,
      vatRate: VAT_RATE,
      requiredPrefix: REQUIRED_PREFIX,
      errorMessage,
      successMessage
    });
  } catch (error) {
    console.error('Lỗi khi truy vấn danh sách sách (Read Connection):', error);
    res.status(500).render('books', {
      title: 'Lỗi Hệ Thống',
      books: [],
      errorMessage: `Lỗi truy vấn Database (Read Connection): ${error.message}`,
      studentName: STUDENT_NAME,
      studentId: STUDENT_ID,
      vatRate: VAT_RATE,
      requiredPrefix: REQUIRED_PREFIX
    });
  }
};

// POST /books - Them moi sach (Su dung luong GHI - Write Connection)
exports.createBook = async (req, res) => {
  try {
    const { bookCode, title, author, category, price } = req.body;

    const trimmedCode = (bookCode || '').trim();

    // 1. THUAT TOAN CA NHAN HOA: Kiem tra tien to 3 so cuoi MSSV (182)
    if (!trimmedCode.startsWith(REQUIRED_PREFIX)) {
      req.session.errorMessage = `[TỪ CHỐI XỬ LÝ]: Mã sản phẩm "${trimmedCode}" không hợp lệ! Bắt buộc phải có tiền tố là 3 số cuối MSSV của bạn (${REQUIRED_PREFIX}). Ví dụ: ${REQUIRED_PREFIX}-01, ${REQUIRED_PREFIX}-BOOK01`;
      return res.redirect('/');
    }

    // 2. Kiem tra gia hop le
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      req.session.errorMessage = 'Giá tiền sản phẩm không hợp lệ!';
      return res.redirect('/');
    }

    // 3. THUAT TOAN CA NHAN HOA: Tinh gia sau thue theo cong thuc VAT = (So cuoi MSSV + 5)% = 7%
    // Gia sau thue = price * (1 + VAT/100)
    const priceWithVAT = Math.round(numericPrice * (1 + VAT_RATE / 100));

    // 4. Luu xuong Cloud MongoDB Atlas su dung WRITE CONNECTION
    await WriteBookModel.create({
      bookCode: trimmedCode,
      title: (title || '').trim(),
      author: (author || '').trim(),
      category: (category || 'Công nghệ').trim(),
      price: numericPrice,
      vatRate: VAT_RATE,
      priceWithVAT: priceWithVAT
    });

    req.session.successMessage = `[GHI THÀNH CÔNG]: Sách "${title}" (Mã: ${trimmedCode}) đã được lưu xuống Cloud MongoDB Atlas qua Write Connection. Giá gốc: ${numericPrice.toLocaleString('vi-VN')} đ | Giá sau thuế (VAT ${VAT_RATE}%): ${priceWithVAT.toLocaleString('vi-VN')} đ.`;
    return res.redirect('/');
  } catch (error) {
    console.error('Lỗi khi thêm mới sách (Write Connection):', error);
    let msg = error.message;
    if (error.code === 11000) {
      msg = `Mã sách "${req.body.bookCode}" đã tồn tại trong cơ sở dữ liệu! Vui lòng chọn mã khác.`;
    }
    req.session.errorMessage = `Lỗi ghi dữ liệu (Write Connection): ${msg}`;
    return res.redirect('/');
  }
};

// POST /books/delete/:id - Xoa sach (Write Connection)
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    await WriteBookModel.findByIdAndDelete(id);
    req.session.successMessage = 'Đã xoá sách thành công qua Write Connection!';
    res.redirect('/');
  } catch (error) {
    req.session.errorMessage = `Lỗi khi xoá sách: ${error.message}`;
    res.redirect('/');
  }
};
