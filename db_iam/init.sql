CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

-- Tabela de controlo de acessos
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação do utilizador para o Node.js usar (admin/admin)
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY 'admin';
GRANT ALL PRIVILEGES ON auth_db.* TO 'admin'@'%';
FLUSH PRIVILEGES;

-- Injeção do Administrador (Email: admin | Password: admin)
-- A string gerada pelo bcrypt abaixo corresponde à palavra "admin"
INSERT INTO users (email, password_hash, role) 
VALUES ('admin', '$2b$10$wPH94TJkGdofzMF4xUmQv.ogYk03hqH5cu00ScSmstaBZGLTSGW2y', 'admin');