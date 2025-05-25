require('dotenv').config();
const { Pool } = require('pg');

console.log('TYPE OF PASSWORD:', typeof process.env.PG_PASSWORD);
console.log('VALUE OF PASSWORD:', process.env.PG_PASSWORD);
console.log("PG_USER:", typeof process.env.PG_USER, process.env.PG_USER);
console.log("PG_PASSWORD:", typeof process.env.PG_PASSWORD, process.env.PG_PASSWORD);
console.log("PG_DATABASE:", typeof process.env.PG_DATABASE, process.env.PG_DATABASE);
const pool = new Pool({
  user: String(process.env.PG_USER),
  host: String(process.env.PG_HOST),
  database: String(process.env.PG_DATABASE),
  password: String(process.env.PG_PASSWORD),
  port: parseInt(process.env.PG_PORT || '5432', 10), 
});
pool.connect()
  .then(() => console.log('✅ تم الاتصال بقاعدة البيانات'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

module.exports = pool;