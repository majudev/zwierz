FROM node:20-alpine

WORKDIR /backend

COPY . .

RUN npm install && npx prisma generate && npm run build

CMD ["npm", "run", "start"]
