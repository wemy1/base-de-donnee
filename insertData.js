const { Client } = require('pg');

// معلومات الاتصال بقاعدة البيانات
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'depannage',
  password: 'meriem2025!',
  port: 5432,
});

// الاتصال بقاعدة البيانات
client.connect()
  .then(() => {
    console.log('Connected to database');

    // إدخال البيانات
    const query = 
     ` INSERT INTO "User" (nom, prenom, email, mot_de_passe) 
      VALUES
      ('Meriem', 'LastName1', 'meriem@example.com', 'password123'),
      ('Ahmed', 'LastName2', 'ahmed@example.com', 'password123'),
      ('Sara', 'LastName3', 'sara@example.com', 'password123');
    `;

    return client.query(query);
  })
  .then(() => {
    console.log('Data inserted successfully');
    client.end(); // إغلاق الاتصال بعد إدخال البيانات
  })
  .catch(err => {
    console.error('Error inserting data:', err.stack);
    client.end(); // إغلاق الاتصال في حالة حدوث خطأ
  });
