const { Client } = require('pg');

// إعدادات الاتصال بقاعدة البيانات
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'depannage',
  password: 'meriem2025!',
  port: 5432,
});
// الاتصال بقاعدة البيانات
client.connect()
  .then(() => console.log("✅ Connected to the database"))
  // 1. جدول User
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS "User" (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(100) NOT NULL,
      prenom VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      mot_de_passe VARCHAR(255) NOT NULL
    );
  `)).then(() => console.log("✅ Table 'User' created successfully"))

  // 2. جدول Client
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS Client (
      id SERIAL PRIMARY KEY,
      telephone VARCHAR(15) NOT NULL,
      adresse TEXT,
      paiement_id INTEGER,
      CONSTRAINT fk_paiement FOREIGN KEY (paiement_id) REFERENCES Paiement(id) ON DELETE CASCADE
    );
  `)).then(() => console.log("✅ Table 'Client' created successfully"))

  // 3. جدول Service
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS Service (
      id_service SERIAL PRIMARY KEY,
      description TEXT NOT NULL,
      prix FLOAT NOT NULL,
      statut BOOLEAN DEFAULT FALSE
    );
  `)).then(() => console.log("✅ Table 'Service' created successfully"))

  // 4. جدول Technicien
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS Technicien (
      id SERIAL PRIMARY KEY,
      specialite TEXT NOT NULL
    );
  `)).then(() => console.log("✅ Table 'Technicien' created successfully"))

  // 5. جدول ServiceProposé
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS ServiceProposé (
      id SERIAL PRIMARY KEY,
      id_technicien INTEGER,
      id_service INTEGER,
      CONSTRAINT fk_technicien FOREIGN KEY (id_technicien) REFERENCES Technicien(id) ON DELETE CASCADE,
      CONSTRAINT fk_service FOREIGN KEY (id_service) REFERENCES Service(id) ON DELETE CASCADE
    );
  `)).then(() => console.log("✅ Table 'ServiceProposé' created successfully"))

  // 6. جدول Avis
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS Avis (
      id SERIAL PRIMARY KEY,
      note INTEGER NOT NULL,
      commentaire TEXT,
      date DATE DEFAULT CURRENT_DATE
    );
  `)).then(() => console.log("✅ Table 'Avis' created successfully"))

  // 7. جدول ModePaiement
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS ModePaiement (
      id SERIAL PRIMARY KEY
    );
  `)).then(() => console.log("✅ Table 'ModePaiement' created successfully"))

  // 8. جدول Paiement
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS Paiement (
      id SERIAL PRIMARY KEY,
      montant FLOAT NOT NULL,
      mode_paiement_id INTEGER,
      date DATE DEFAULT CURRENT_DATE,
      CONSTRAINT fk_mode_paiement FOREIGN KEY (mode_paiement_id) REFERENCES ModePaiement(id) ON DELETE CASCADE
    );
  `)).then(() => console.log("✅ Table 'Paiement' created successfully"))

  // 9. جدول Paypal
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS Paypal (
      id SERIAL PRIMARY KEY,
      email VARCHAR(150) UNIQUE NOT NULL
    );
  `)).then(() => console.log("✅ Table 'Paypal' created successfully"))

  // 10. جدول CarteBancaire
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS CarteBancaire (
      id SERIAL PRIMARY KEY,
      numero VARCHAR(20) UNIQUE NOT NULL,
      cvv VARCHAR(5) NOT NULL
    );
  `)).then(() => console.log("✅ Table 'CarteBancaire' created successfully"))

  // 11. جدول Espece
  .then(() => client.query(`
    CREATE TABLE IF NOT EXISTS Espece (
      id SERIAL PRIMARY KEY
    );
  `)).then(() => console.log("✅ Table 'Espece' created successfully"))

  // إنهاء الاتصال بقاعدة البيانات
  .catch(err => console.error("❌ Error:", err.stack))
  .finally(() => client.end());