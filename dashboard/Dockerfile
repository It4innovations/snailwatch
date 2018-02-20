FROM node:carbon-slim as build

WORKDIR /dashboard
COPY package.json package-lock.json ./
RUN npm install
COPY . ./

CMD rm -rf build && npm run build && ./node_modules/.bin/serve -p 3000 -s build
