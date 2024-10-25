FROM node:21-alpine

WORKDIR /frontend

RUN npm install -g serve

COPY . .

RUN npm install

ENTRYPOINT ["/frontend/serve.sh"]
