FROM node:9-slim as build

ARG PUBLIC_URL=.
ENV PUBLIC_URL=$PUBLIC_URL

WORKDIR /dashboard
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:9-slim

WORKDIR /dashboard
COPY --from=build /dashboard/build .

EXPOSE 3000

CMD node server.js
