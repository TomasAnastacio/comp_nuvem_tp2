CREATE DATABASE IF NOT EXISTS ementas_db;
USE ementas_db;

-- 1. Tabela de Alérgenos (Atómica)
CREATE TABLE IF NOT EXISTS alergenos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- 2. Tabela de Pratos
CREATE TABLE IF NOT EXISTS pratos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT
);

-- 3. Tabela de Junção (M:N) - Alérgenos por Prato [9, 6]
CREATE TABLE IF NOT EXISTS prato_alergenos (
    prato_id INT,
    alergeno_id INT,
    PRIMARY KEY (prato_id, alergeno_id),
    FOREIGN KEY (prato_id) REFERENCES pratos(id) ON DELETE CASCADE,
    FOREIGN KEY (alergeno_id) REFERENCES alergenos(id) ON DELETE CASCADE
);

-- 4. Tabela de Ementas (Gestão Diária)
CREATE TABLE IF NOT EXISTS ementas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    data DATE NOT NULL,
    tipo_refeicao ENUM('Carne', 'Peixe', 'Vegetariano') NOT NULL,
    prato_id INT,
    FOREIGN KEY (prato_id) REFERENCES pratos(id)
);

-- Configuração de Utilizador Restrito (Requisito do Enunciado) [10]
CREATE USER IF NOT EXISTS 'aaualg_user'@'%' IDENTIFIED BY 'aaualg_pass_2025';
GRANT SELECT, INSERT, UPDATE, DELETE ON ementas_db.* TO 'aaualg_user'@'%';
FLUSH PRIVILEGES;