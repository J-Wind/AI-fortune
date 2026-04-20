FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build:prod

EXPOSE 8080

CMD ["node", "simple-server.js"]
