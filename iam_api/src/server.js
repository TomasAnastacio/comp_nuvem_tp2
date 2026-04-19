const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET; // Vai ler do nosso ficheiro .env

// Rota de Healthcheck (Boa prática para monitorização na nuvem)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'IAM API operacional e segura.' });
});

// A rota sagrada de Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e password são obrigatórios.' });
    }

    try {
        // 1. Procurar o utilizador na BD db-iam
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const user = rows[0];

        // 2. Verificar se a password em texto limpo corresponde ao hash cifrado na BD
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 3. Sucesso! Emitir o JWT (A nossa "pulseira VIP")
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '4h' } // Expira em 4 horas
        );

        console.log(`[IAM-API] JWT gerado com sucesso para: ${user.email}`);
        res.json({ token: token });

    } catch (error) {
        console.error('[IAM-API] Erro interno:', error);
        res.status(500).json({ error: 'Erro interno do servidor IAM.' });
    }
});

app.listen(PORT, () => {
    console.log(`[IAM-API] Servidor de Identidade a correr na porta ${PORT}`);
});