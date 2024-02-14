FROM node:18-slim AS installer
WORKDIR /app/src/app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

FROM installer AS builder
WORKDIR /app/src/app

RUN npm run build

FROM builder AS production
WORKDIR /app/src/app

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

EXPOSE $PORT

CMD [ "npm", "run", "start:prod" ]