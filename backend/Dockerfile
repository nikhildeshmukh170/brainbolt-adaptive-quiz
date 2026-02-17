FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl netcat-openbsd

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD sh -c "until nc -z db 5432; do echo 'Waiting for DB...'; sleep 2; done && npx prisma migrate dev --name init --skip-seed || true && npx prisma db seed && npm run dev"
