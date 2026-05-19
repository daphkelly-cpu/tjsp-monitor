FROM node:18-slim

WORKDIR /app

COPY package*.json ./
COPY app.js ./

RUN npm ci --only=production

EXPOSE 8080

CMD ["npm", "start"]
