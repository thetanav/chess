import express from "express";
import db from "@repo/db";
import cors from "cors";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "auth";

const app = express();

app.use(
  cors({
    origin: "https://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.all("/auth/*", toNodeHandler(auth));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Server!");
});

app.get("/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});

app.get("/dp/:id", async (req, res) => {
  const { id } = req.params;
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  if (user) {
    return Response.json({ name: user.name, image: user.image });
  }
  return Response.json({
    name: "unknown",
    image:
      "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg",
  });
});

app.get("/count/game", async (req, res) => {
  const count = await db.game.count();
  return res.json({ count });
});

app.post("/games", async (req, res) => {
  const { userId } = req.body;
  const matches = await db.game.findMany({
    where: {
      OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
    },
    include: {
      whitePlayer: true,
      blackPlayer: true,
    },
    orderBy: {
      endAt: "desc",
    },
  });
  return res.json({ matches });
});

app.listen(process.env.PORT, () => {
  console.log(`HTTP Server is running on port ${process.env.PORT}`);
});
