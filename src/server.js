require('dotenv').config();
const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const bookRoutes = require('./routes/bookRoutes');
const { STUDENT_NAME, STUDENT_ID, REQUIRED_PREFIX, VAT_RATE } = require('./config/constants');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Cau hinh Template Engine Handlebars
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  helpers: {
    formatNumber: (n) => (n ? Number(n).toLocaleString('vi-VN') : '0')
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middlewares co ban
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 3. STATELESS SESSION (Kien truc khong luu trang thai tren RAM may chu)
// Su dung MongoStore luu truc tiep xuong MongoDB Atlas Cloud
const sessionStoreUri = process.env.MONGODB_WRITE_URI || process.env.MONGODB_READ_URI || 'mongodb://localhost:27017/DB_23IT182_temp';

app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret_cloud_23IT182',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: sessionStoreUri,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60, // 14 ngay
    autoRemove: 'native'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 ngay
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' // true khi deploy HTTPS (Render)
  }
}));

// 4. Routes
app.use('/', bookRoutes);

// 5. Khoi dong Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CLOUD BOOK MANAGER - KIỂM TRA GIỮA KỲ ĐIỆN TOÁN ĐÁM MÂY`);
  console.log(`👨‍🎓 Sinh viên: ${STUDENT_NAME} (MSSV: ${STUDENT_ID})`);
  console.log(`📌 Tiền tố mã sách yêu cầu: ${REQUIRED_PREFIX}`);
  console.log(`📊 Mức thuế VAT áp dụng: ${VAT_RATE}%`);
  console.log(`🌐 Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
