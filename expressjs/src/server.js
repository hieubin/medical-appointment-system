import { app } from "./app.js";
import { config } from "./config/index.js";
import { prisma } from "./config/database.js";

async function start() {
  await prisma.$connect();
  app.listen(config.port, () => {
    console.log(`Express API: http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error("Không khởi động được server:", err);
  process.exit(1);
});
