import db from "@repo/db";

async function main() {
  const count = await db.game.count();

  console.log("Game count:", count);
}

main();
