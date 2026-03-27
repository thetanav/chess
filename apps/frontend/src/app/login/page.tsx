import { signIn } from "@/lib/auth-client";
import axios from "axios";
import Image from "next/image";

export default async function Login() {
  const { data } = await axios("https://localhost:3001/count/game");

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-stone-950 px-4 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] rounded-b-[6rem] bg-gradient-to-b from-amber-400/20 via-amber-400/10 to-transparent blur-3xl" />

      <div className="card relative flex w-full max-w-2xl flex-col gap-10 px-10 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-[2rem] bg-white/10 shadow-[0_28px_60px_-32px_rgba(0,0,0,1)] sm:mx-0">
          <Image src="/chess.png" className="h-24 w-24" width={96} height={96} alt="logo" />
        </div>

        <div className="flex w-full flex-col gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-stone-50">Log in to continue</h1>
            <p className="text-sm leading-relaxed text-stone-300">
              Jump back into your ongoing matches or start a fresh one. All we need is a quick
              Google sign in.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn.social({
                provider: "google",
              });
            }}
            className="inline-flex"
          >
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 px-6 py-2 text-sm font-semibold text-stone-100 transition-transform duration-200 hover:-translate-y-[2px] hover:bg-white/20"
            >
              Continue with Google
            </button>
          </form>

          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
            {data.count} game{data.count < 2 ? "" : "s"} going!
          </p>

          <p className="text-sm text-stone-400">
            Built by{" "}
            <a
              href="https://x.com/tanavtwt"
              className="underline-offset-4 transition hover:underline"
              target="_blank"
            >
              tanav
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
