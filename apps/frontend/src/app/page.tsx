import { auth, signIn, signOut } from "@/auth";
import { db } from "@/db";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default async function Home() {
  const session = await auth();
  const matches = await db.game.findMany({
    where: {
      OR: [
        { whitePlayerId: session?.user?.id },
        { blackPlayerId: session?.user?.id },
      ],
    },
    include: {
      whitePlayer: true,
      blackPlayer: true,
    },
    orderBy: {
      endAt: "desc",
    },
  });
  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-stone-700">
            <Image src="/chess.png" alt="Chess" width={24} height={24} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Chess</span>
        </Link>

        <div className="flex items-center gap-3">
          <Suspense>
            {session?.user ? (
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "avatar"}
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                )}
                <span className="text-sm font-medium text-stone-300">
                  {session.user.name}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}>
                  <button
                    type="submit"
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/10">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}>
                <button
                  type="submit"
                  className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20">
                  Sign in
                </button>
              </form>
            )}
          </Suspense>
        </div>
      </div>

      {/* Hero */}
      <section className="mt-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="w-20 h-20 bg-stone-700 flex items-center rounded-xl justify-center shadow-lg shadow-black/20">
            <Image src="/chess.png" alt="logo" width={32} height={15} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Play</h1>
            <p className="text-sm text-stone-400">Start a game</p>
          </div>
        </div>

        {/* Modes */}
        <div className="mt-5 flex gap-4 overflow-x-auto pb-1">
          {[
            { href: "/game", label: "With Random Player" },
            { href: "/game", label: "With a Friend" },
            { href: "/game", label: "With Bot" },
          ].map((m) => (
            <Link
              key={m.label}
              className="group relative min-w-48 overflow-hidden rounded-xl border border-white/5 bg-white/5 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              href={m.href}>
              <Image
                src="/chessboard.png"
                alt="board"
                width={500}
                height={500}
                className="pointer-events-none select-none opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              <p className="absolute bottom-2 left-0 right-0 mx-3 rounded-md bg-black/40 px-3 py-1 text-center text-sm font-semibold">
                {m.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* history games  */}
      <section className="mt-10 rounded-xl border border-white/5 bg-white/5">
        <div className="px-6 py-4">
          <h4 className="text-xl font-bold">Game History</h4>
          {matches.length == 0 ? (
            <p className="mt-2 text-sm text-stone-400">
              No past games yet. Play your first match!
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {matches.map((game) => {
                const isWhite = game.whitePlayerId === session?.user?.id;
                const opponent = isWhite ? game.blackPlayer : game.whitePlayer;
                const result = game.result;
                let outcome = "Draw";
                if (result === "WHITE_WINS") {
                  outcome = isWhite ? "Won" : "Lost";
                } else if (result === "BLACK_WINS") {
                  outcome = isWhite ? "Lost" : "Won";
                }
                return (
                  <li
                    key={game.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                      {opponent.image && (
                        <Image
                          src={opponent.image}
                          alt={opponent.name ?? "Opponent"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          vs {opponent.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {game.endAt
                            ? new Date(game.endAt).toLocaleDateString()
                            : "Unknown"}{" "}
                          • {game.status.replace("_", " ").toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        outcome === "Won"
                          ? "text-green-400"
                          : outcome === "Lost"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}>
                      {outcome}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
