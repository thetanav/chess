import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma/client";
export { Prisma, PrismaClient } from "./generated/prisma/client";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectionUrl = new URL(process.env.DATABASE_URL!);
connectionUrl.searchParams.delete("channel_binding");

const db: PrismaClient = new PrismaClient({
  adapter: new PrismaPg(connectionUrl.toString()),
});

export default db;
