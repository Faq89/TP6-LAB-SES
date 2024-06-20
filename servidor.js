import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';

const app = express();
const SECRET_KEY = 'your_secret_key';  // Cambia esto por una clave secreta segura
const users = [];  // Lista para almacenar usuarios

app.use(morgan('dev'));     // Loggea cada request en consola
app.use(cookieParser());    // Para leer cookies
app.use(express.json());    // Para leer JSONs
app.use(express.static('public'));  // Para servir archivos estáticos

// Ruta para registrar usuarios
app.post('/register', (req, res) => {
    const { username, password, name, phone } = req.body;
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Usuario ya existe' });
    }
    users.push({ username, password, name, phone });
    res.status(201).json({ message: 'Usuario registrado' });
});

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Inicio de sesión exitoso', user: { username: user.username, name: user.name, phone: user.phone } });
});

// Ruta para verificar el token y obtener información del usuario
app.get('/info', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'No autorizado' });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = users.find(user => user.username === decoded.username);
        res.json({ user });
    } catch (e) {
        res.status(401).json({ message: 'Token inválido' });
    }
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada' });
});

app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});
