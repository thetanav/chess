import { auth, signIn, signOut } from "@/auth";
import db from "@repo/db";
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
    <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] rounded-b-[6rem] bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent blur-3xl" />

      <header className="card card-hover flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-white/0 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.8)]">
            <Image src="/chess.png" alt="Chess" width={28} height={28} />
          </span>
          <span className="text-lg font-extrabold tracking-tight">Chess</span>
        </Link>

        <Suspense>
          {session?.user ? (
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2 py-1.5">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "avatar"}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-medium text-stone-200">
                {session.user.name}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}>
                <button
                  type="submit"
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-stone-50 transition-colors hover:bg-white/20">
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
                className="rounded-full border border-amber-400/30 bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-400/30">
                Sign in
              </button>
            </form>
          )}
        </Suspense>
      </header>

      <main className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <section className="flex flex-col gap-10">
          <div className="card card-hover flex flex-col gap-6 px-8 py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black sm:text-4xl">
                    Find your next opponent.
                  </h1>
                  <p className="text-sm leading-relaxed text-stone-300 sm:text-base">
                    Queue up for a live match or invite a friend. Every move is
                    synced instantly through our realtime servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Live Matches", value: matches.length.toString() },
                {
                  label: "Openings Tracked",
                  value: "Real-time",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/5 bg-white/5 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-stone-50">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-100">
                Play styles
              </h2>
              <span className="text-xs uppercase tracking-[0.32em] text-stone-500">
                Choose mode
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { href: "/game", label: "Match me instantly" },
                { href: "/game", label: "Invite a friend" },
                { href: "/game", label: "Practice with the bot" },
              ].map((m) => (
                <Link
                  key={m.label}
                  className="card card-hover group relative overflow-hidden px-5 py-6"
                  href={m.href}>
                  <Image
                    src="/chessboard.png"
                    alt="board"
                    width={500}
                    height={500}
                    className="pointer-events-none absolute inset-0 h-full w-full scale-105 select-none opacity-0 transition-opacity duration-300 group-hover:opacity-40"
                  />
                  <div className="relative flex h-full flex-col justify-between gap-10">
                    <p className="text-sm font-semibold text-stone-100">
                      {m.label}
                    </p>
                    <span className="text-xs uppercase tracking-[0.28em] text-stone-400">
                      Queue →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </section>

        <section className="card card-hover h-fit px-7 py-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-100">
              Game history
            </h2>
            <span className="text-xs text-stone-500">
              {matches.length} {matches.length === 1 ? "match" : "matches"}
            </span>
          </div>

          {matches.length === 0 ? (
            <p className="mt-6 text-sm text-stone-400">
              No past games yet. Play your first match!
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
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
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-5 py-4">
                    <div className="flex items-center gap-3">
                      {opponent.image && (
                        <Image
                          src={opponent.image}
                          alt={opponent.name ?? "Opponent"}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-stone-100">
                          vs {opponent.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-stone-500">
                          {game.endAt
                            ? new Date(game.endAt).toLocaleDateString()
                            : "Unknown"}
                          {" • "}
                          {game.status.replace("_", " ").toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        outcome === "Won"
                          ? "bg-emerald-400/20 text-emerald-300"
                          : outcome === "Lost"
                            ? "bg-rose-400/20 text-rose-300"
                            : "bg-amber-400/20 text-amber-300"
                      }`}>
                      {outcome}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
