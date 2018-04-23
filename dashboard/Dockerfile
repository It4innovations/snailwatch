FROM node:carbon-slim as build

ENV PUBLIC_URL=.

WORKDIR /dashboard
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:carbon-slim

WORKDIR /dashboard
COPY --from=build /dashboard/build .

EXPOSE 3000

CMD node server.js
