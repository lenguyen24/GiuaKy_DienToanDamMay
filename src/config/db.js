const mongoose = require('mongoose');

// Lay URI tu bien moi truong
const READ_URI = process.env.MONGODB_READ_URI;
const WRITE_URI = process.env.MONGODB_WRITE_URI;

if (!READ_URI || !WRITE_URI) {
  console.warn("⚠️ [CANH BAO] MONGODB_READ_URI hoac MONGODB_WRITE_URI chua duoc cau hinh trong .env!");
}

// 1. Connection chuyen biet cho luong DOC (Least Privilege: Role 'read')
const readConnection = mongoose.createConnection(READ_URI || 'mongodb://localhost:27017/DB_23IT182_temp');

// 2. Connection chuyen biet cho luong GHI (Least Privilege: Role 'readWrite')
const writeConnection = mongoose.createConnection(WRITE_URI || 'mongodb://localhost:27017/DB_23IT182_temp');

readConnection.on('connected', () => {
  console.log('✅ [READ CONNECTION] Da ket noi thanh cong MongoDB Atlas (Quyen DOC - Read-Only)');
});

readConnection.on('error', (err) => {
  console.error('❌ [READ CONNECTION LOI]:', err.message);
});

writeConnection.on('connected', () => {
  console.log('✅ [WRITE CONNECTION] Da ket noi thanh cong MongoDB Atlas (Quyen GHI - Read/Write)');
});

writeConnection.on('error', (err) => {
  console.error('❌ [WRITE CONNECTION LOI]:', err.message);
});

module.exports = {
  readConnection,
  writeConnection
};
