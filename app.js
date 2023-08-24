const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();

// Configuración de la base de datos MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bolsaTrabajo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conexión exitosa a MongoDB');
});

// Configuración de Multer para cargar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Configuración de Pug como motor de plantillas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Definición del modelo de la base de datos
const File = mongoose.model('File', {
  filename: String,
  uploadedAt: Date,
});

// Rutas
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { filename } = req.file;

    // Guardar información del archivo en la base de datos
    const file = new File({ filename, uploadedAt: new Date() });
    await file.save();

    res.json({ message: 'Archivo subido exitosamente y registrado en la base de datos.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al subir el archivo y guardar en la base de datos.' });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en funcionamiento en el puerto ${PORT}`);
});
