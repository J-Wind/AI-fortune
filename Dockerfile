FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build:prod

EXPOSE 3001

CMD ["npm", "start"]