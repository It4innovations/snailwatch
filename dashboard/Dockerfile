FROM node:carbon-slim

WORKDIR /dashboard

COPY . .

# install npm dependencies
RUN npm install &&      \
    npm install serve

CMD rm -rf build && npm run build && ./node_modules/.bin/serve -p 3000 -s build
