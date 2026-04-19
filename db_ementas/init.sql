CREATE DATABASE IF NOT EXISTS ementas_db;
USE ementas_db;

-- 1. Tabela de Alérgenos
CREATE TABLE IF NOT EXISTS alergenos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Tabela de Pratos
CREATE TABLE IF NOT EXISTS pratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo ENUM('Carne', 'Peixe', 'Vegetariano', 'Vegan', 'Sobremesa') NOT NULL
);

-- 3. Tabela de Ementas
CREATE TABLE IF NOT EXISTS ementas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL UNIQUE,
    dia_semana VARCHAR(20) NOT NULL
);

-- 4. Tabela de Junção (Pratos <-> Alérgenos)
CREATE TABLE IF NOT EXISTS prato_alergeno (
    prato_id INT,
    alergeno_id INT,
    PRIMARY KEY (prato_id, alergeno_id),
    FOREIGN KEY (prato_id) REFERENCES pratos(id) ON DELETE CASCADE,
    FOREIGN KEY (alergeno_id) REFERENCES alergenos(id) ON DELETE CASCADE
);

-- 5. Tabela de Junção (Ementas <-> Pratos)
CREATE TABLE IF NOT EXISTS ementa_prato (
    ementa_id INT,
    prato_id INT,
    PRIMARY KEY (ementa_id, prato_id),
    FOREIGN KEY (ementa_id) REFERENCES ementas(id) ON DELETE CASCADE,
    FOREIGN KEY (prato_id) REFERENCES pratos(id) ON DELETE CASCADE
);

-- Utilizador e permissões para o Node.js (admin/admin)
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY 'admin';
GRANT ALL PRIVILEGES ON ementas_db.* TO 'admin'@'%';
FLUSH PRIVILEGES;


-- ==========================================
-- INJEÇÃO DE DADOS INICIAIS (SEED DATA)
-- Baseado na Ementa Semanal dos Bares AAUAlg
-- ==========================================

-- Inserir Alérgenos comuns
INSERT INTO alergenos (nome) VALUES 
('Glúten'), ('Lactose'), ('Soja'), ('Ovos'), ('Frutos de Casca Rija');

-- Inserir Pratos da Semana e Opções Diárias
INSERT INTO pratos (id, nome, descricao, tipo) VALUES
(1, 'Hambúrgueres Mistos', 'Hambúrgueres com acompanhamento', 'Carne'),
(2, 'Bacalhau com Natas', 'Prato de bacalhau gratinado no forno', 'Peixe'),
(3, 'Perna de Peru Estufada', 'Peru estufado com legumes', 'Carne'),
(4, 'Strogonoff de Porco', 'Tiras de porco com molho cremoso', 'Carne'),
(5, 'Legumes à Brás', 'Salteado de legumes com batata palha', 'Vegetariano'),
(6, 'Bitoque', 'Bife com ovo a cavalo (Todos os dias)', 'Carne'),
(7, 'Quiche', 'Tarte salgada (Todos os dias)', 'Vegetariano');

-- Relacionar alguns pratos com alérgenos (Exemplos)
INSERT INTO prato_alergeno (prato_id, alergeno_id) VALUES
(1, 1), -- Hambúrgueres têm Glúten
(2, 2), -- Bacalhau com Natas tem Lactose
(5, 4), -- Legumes à Brás têm Ovos
(7, 1), (7, 2), (7, 4); -- Quiche tem Glúten, Lactose e Ovos

-- Inserir os Dias da Ementa (Usando datas fictícias para a semana)
INSERT INTO ementas (id, data, dia_semana) VALUES
(1, '2026-04-13', 'Segunda-feira'),
(2, '2026-04-14', 'Terça-feira'),
(3, '2026-04-15', 'Quarta-feira'),
(4, '2026-04-16', 'Quinta-feira'),
(5, '2026-04-17', 'Sexta-feira');

-- Associar Pratos aos Dias (Prato do Dia + Opções Fixas)
-- Segunda-feira (Hambúrgueres + Bitoque + Quiche)
INSERT INTO ementa_prato (ementa_id, prato_id) VALUES (1, 1), (1, 6), (1, 7);
-- Terça-feira (Bacalhau com Natas + Bitoque + Quiche)
INSERT INTO ementa_prato (ementa_id, prato_id) VALUES (2, 2), (2, 6), (2, 7);
-- Quarta-feira (Perna de Peru + Bitoque + Quiche)
INSERT INTO ementa_prato (ementa_id, prato_id) VALUES (3, 3), (3, 6), (3, 7);
-- Quinta-feira (Strogonoff + Bitoque + Quiche)
INSERT INTO ementa_prato (ementa_id, prato_id) VALUES (4, 4), (4, 6), (4, 7);
-- Sexta-feira (Legumes à Brás + Bitoque + Quiche)
INSERT INTO ementa_prato (ementa_id, prato_id) VALUES (5, 5), (5, 6), (5, 7);