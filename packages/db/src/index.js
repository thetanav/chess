"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const db = new client_1.PrismaClient({ adapter });
db.$connect()
    .then(() => {
    console.log("Connected to the database");
})
    .catch((error) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
});
exports.default = db;
