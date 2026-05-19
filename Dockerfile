FROM ghcr.io/puppeteer/puppeteer:22.0.0

WORKDIR /app

COPY package.json .
COPY app.js .

RUN npm install

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

EXPOSE 8080

CMD ["node", "app.js"]
