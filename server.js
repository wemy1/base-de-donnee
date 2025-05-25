const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const requestResetPassword = require('./service/requestResetPassword');
const resetPassword = require('./service/resetPassword');
const userController = require('./controllers/userController');
const getServices = require('./service/getServices');
const loginTechnicien = require('./service/loginTechnicien');
const loginAdminRoute = require('./service/loginAdmin');
const getTechnicienById = require('./service/getTechnicienById');
const createAvis = require('./service/createAvis');
const getAvisByTechnicienId = require('./service/getAvisByTechnicienId');
const createDemande = require('./service/createDemande');
const getDemandesByTechnicien = require('./service/getDemandesByTechnicien');
const updateDemandeStatut = require('./service/updateDemandeStatut');
const getDemandeById = require('./service/getDemandeById');
const deleteDemande = require('./service/deleteDemande.js');
const updateDemande = require('./service/updateDemande');
const getPublicDemandes = require('./service/getPublicDemandes');
const getDemandesByClient = require('./service/getDemandesByClient');
const getAcceptedDemandesByTechnicien = require('./service/getAcceptedDemandesByTechnicien');
const assignTechnicienToDemande = require('./service/assignTechnicienToDemande');
const cancelDemande = require('./service/cancelDemande');
const getAllClients = require('./service/getAllClients');
const deleteClient = require('./service/deleteClient');
const getAllTechniciens = require('./service/getAllTechniciens');
const deleteTechnicien = require('./service/deleteTechnicien');
const getAllDemandes = require('./service/getAllDemandes');
const getAllAvis = require('./service/getAllAvis');
const deleteAvis = require('./service/deleteAvis');
const addService = require('./service/addService');
const deleteService = require('./service/deleteService');
const updateService = require('./service/updateService');

dotenv.config();

const app = express();
const port = 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`🟢 الطلب وصل إلى ${req.method} ${req.url}`);
  }
  next();
});

app.post('/request-reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await requestResetPassword(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/reset-password', async (req, res) => {
  try {
    const { email, verification_code, newPassword } = req.body;
    const result = await resetPassword(email, verification_code, newPassword);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api', loginAdminRoute);
app.use('/api/technicien', getTechnicienById);
app.use('/api/avis', createAvis);
app.post('/api/technicien/login', loginTechnicien);
app.get('/api/service', getServices);
app.use('/api/avis/technicien', getAvisByTechnicienId);
app.use('/api/public-demandes', createDemande);
app.use('/api/technicien-demandes', getDemandesByTechnicien);
app.put('/api/demande/:id_demande/statut', updateDemandeStatut);
app.use('/api/demande', getDemandeById);
app.use('/api/demande', deleteDemande);
app.use('/api/demande', updateDemande);
app.use('/api/public-demandes', getPublicDemandes);
app.get('/api/client-demandes/:clientId', getDemandesByClient);
app.get('/api/accepted-demandes/:technicienId', getAcceptedDemandesByTechnicien);
app.put('/api/public-demandes/:id_demande/assign', assignTechnicienToDemande);
app.put('/api/demandes/:id_demande/cancel', cancelDemande);
app.get('/api/clients/', getAllClients);
app.delete('/api/client/', deleteClient);
app.get('/api/techniciens/', getAllTechniciens);
app.delete('/api/technicien/', deleteTechnicien);
app.get('/api/Demandes/', getAllDemandes);
app.delete('/api/Demande/', deleteDemande);
app.get('/api/avis/', getAllAvis);
app.delete('/api/avis/', deleteAvis);
app.post('/api/service/', addService);
app.put('/api/service/', updateService);
app.delete('/api/service/', deleteService);

app.post('/api/signup', userController.signup);
app.post('/api/verify', userController.verifyEmail);
app.post('/api/login', userController.login);

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});