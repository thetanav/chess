import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import prismaClient from "@prisma/client";
import { config as loadEnv } from "dotenv";

const { PrismaClient } = prismaClient;

loadEnv({ path: path.resolve(__dirname, "../../.env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

db.$connect()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error: unknown) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });

export default db;
