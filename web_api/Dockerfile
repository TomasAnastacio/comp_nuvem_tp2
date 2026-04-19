FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# A porta 8080 que mapeámos no docker-compose.yml
EXPOSE 8080

CMD ["npm", "start"]