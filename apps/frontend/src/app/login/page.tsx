import { signIn } from "@/auth";
import { db } from "@/db";
import Image from "next/image";

export default async function Login() {
  const usercount = await db.game.count();

  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="w-fit rounded-lg bg-stone-700 px-16 py-12 flex items-center justify-center gap-24">
        <Image
          src="/chess.png"
          className="w-36"
          width={50}
          height={50}
          alt="logo"
        />
        <div>
          <h1 className="text-2xl font-black">Play Chess on #2 Site</h1>
          <h3 className="text-sm text-stone-300 mt-1">
            Login to continue playing chess
          </h3>

          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}>
            <button
              type="submit"
              className="mt-5 border rounded-md px-4 py-1 text-sm border-stone-400 hover:bg-stone-600 hover:border-white transition-colors">
              Login With Google
            </button>
          </form>

          <p className="mt-6 animate-pulse text-sm text-stone-400">
            {usercount} game played
          </p>

          <p className="mt-4 text-sm text-stone-400">
            made with ❤️ by{" "}
            <a
              href="https://x.com/tanavtwt"
              className="underline hover:no-underline"
              target="_blank">
              tanav
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
