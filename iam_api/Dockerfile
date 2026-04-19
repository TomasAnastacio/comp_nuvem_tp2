FROM node:18-alpine

WORKDIR /usr/src/app

# Copiar apenas os ficheiros de dependências primeiro (otimização de cache do Docker)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código fonte
COPY . .

# A porta interna que o Express vai usar
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"]