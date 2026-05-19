FROM node:18-slim

RUN apt-get update && apt-get install -y chromium-browser --no-install-recommends

WORKDIR /app

COPY package.json .
COPY app.js .

RUN npm install

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 8080

CMD ["node", "app.js"]
