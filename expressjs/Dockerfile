FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY prisma ./prisma
ENV DATABASE_URL="file:./prisma/data/medical.db"
RUN npx prisma generate

COPY src ./src

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node src/server.js"]
