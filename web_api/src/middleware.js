const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
    // Procurar o token no cabeçalho de Autorização (padrão standard: "Bearer <token>")
    const bearerHeader = req.headers['authorization'];

    if (!bearerHeader) {
        return res.status(403).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const bearer = bearerHeader.split(' ');
    const token = bearer[1];

    try {
        // Verifica criptograficamente a assinatura com a mesma chave do IAM API
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Guardamos os dados do utilizador (incluindo o role) no pedido para as rotas usarem
        req.user = decoded;
        
        // Pode passar à próxima função (a rota do CRUD)
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}

// Opcional mas muito valorizado: Middleware para garantir que só Admins inserem dados
function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acesso negado. Requer privilégios de Administrador.' });
    }
}

module.exports = { verifyToken, requireAdmin };