const express = require('express');
const path = require('path');
const db = require('./db');
const { verifyToken, requireAdmin } = require('./middleware');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;

// ==========================================
// 1. SERVIR O FRONT-END (Ficheiros Estáticos)
// ==========================================
// Tudo o que estiver na pasta 'public' será servido para o browser
app.use(express.static(path.join(__dirname, '../public')));

// ==========================================
// 2. ROTAS PÚBLICAS DA API (Leitura)
// ==========================================
app.get('/api/ementas', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.data, 
                e.dia_semana, 
                p.nome, 
                p.descricao,
                p.tipo,
                GROUP_CONCAT(a.nome SEPARATOR ', ') as alergenos
            FROM ementas e
            LEFT JOIN ementa_prato ep ON e.id = ep.ementa_id
            LEFT JOIN pratos p ON ep.prato_id = p.id
            LEFT JOIN prato_alergeno pa ON p.id = pa.prato_id
            LEFT JOIN alergenos a ON pa.alergeno_id = a.id
            GROUP BY e.id, p.id
            ORDER BY e.data ASC;
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter ementas.' });
    }
});

// ==========================================
// 3. ROTAS PRIVADAS DA API (Back-Office CRUD)
// ==========================================
// Nota como usamos o verifyToken e requireAdmin como barreiras!
app.post('/api/pratos', verifyToken, requireAdmin, async (req, res) => {
    const { nome, descricao, tipo } = req.body;
    
    if (!nome || !tipo) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios.' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO pratos (nome, descricao, tipo) VALUES (?, ?, ?)',
            [nome, descricao, tipo]
        );
        res.status(201).json({ message: 'Prato criado com sucesso!', pratoId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar prato.' });
    }
});

// Rota para listar todos os pratos (Atualizada para trazer a descrição)
app.get('/api/pratos', verifyToken, requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, nome, descricao, tipo FROM pratos ORDER BY nome ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter a lista de pratos.' });
    }
});

// Rota para EDITAR/ATUALIZAR um prato (NOVO)
app.put('/api/pratos/:id', verifyToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, tipo } = req.body;
    
    if (!nome || !tipo) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios.' });
    }

    try {
        const [result] = await db.execute(
            'UPDATE pratos SET nome = ?, descricao = ?, tipo = ? WHERE id = ?',
            [nome, descricao, tipo, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Prato não encontrado.' });
        }
        res.json({ message: 'Prato atualizado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar o prato.' });
    }
});

// Rota Avançada para Criar Ementa e associar múltiplos Pratos (Com Transação ACID)
app.post('/api/ementas', verifyToken, requireAdmin, async (req, res) => {
    const { data, dia_semana, pratos_ids } = req.body;
    
    if (!data || !dia_semana || !pratos_ids || pratos_ids.length === 0) {
        return res.status(400).json({ error: 'Data, dia da semana e pelo menos um prato são obrigatórios.' });
    }

    const connection = await db.getConnection();
    try {
        // Iniciamos uma transação para garantir que ou grava tudo, ou não grava nada!
        await connection.beginTransaction();
        
        // 1. Criar o dia da Ementa
        const [result] = await connection.execute(
            'INSERT INTO ementas (data, dia_semana) VALUES (?, ?)',
            [data, dia_semana]
        );
        const ementaId = result.insertId;

        // 2. Associar os pratos a esse dia na tabela de junção
        for (let pratoId of pratos_ids) {
            await connection.execute(
                'INSERT INTO ementa_prato (ementa_id, prato_id) VALUES (?, ?)',
                [ementaId, pratoId]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Ementa criada com sucesso!' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        // O erro 1062 é o código do MySQL para "Duplicate Entry" (se a data já existir)
        if (error.errno === 1062) return res.status(400).json({ error: 'Já existe uma ementa para esta data.' });
        res.status(500).json({ error: 'Erro ao criar a ementa.' });
    } finally {
        connection.release();
    }
});

// ==========================================
// 4. API GATEWAY (Proxy para Autenticação)
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        // A web-api faz o pedido à iam_api através da rede interna do Docker!
        const response = await fetch('http://iam_api:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        
        // Devolvemos a resposta (seja o JWT ou o erro) ao browser
        res.status(response.status).json(data);
    } catch (error) {
        console.error('[API Gateway] Erro ao contactar IAM:', error);
        res.status(500).json({ error: 'Erro de comunicação com o serviço de segurança.' });
    }
});

app.listen(PORT, () => {
    console.log(`[WEB-API] Servidor Web e CRUD a correr na porta ${PORT}`);
});