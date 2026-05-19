FROM node:18-bullseye

RUN apt-get update && apt-get install -y chromium-browser --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
COPY app.js .

RUN npm install --no-audit --no-fund

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 8080

CMD ["node", "app.js"]
