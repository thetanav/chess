import { auth, signIn, signOut } from "@/auth";
import { db } from "@/db";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
  const session = await auth();

  if (session) {
    return <Home />;
  } else {
    return <Login />;
  }
}

async function Login() {
  const usercount = db.user.count();

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

          <p className="mt-6 animate-pulse test-sm text-stone-400">
            {usercount} playing now
          </p>

          <p className="mt-4 text-sm test-stone-400">
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

async function Home() {
  const session = await auth();

  return (
    <div className="max-w-screen-lg mx-auto p-8">
      <div className="w-full flex justify-between items-center">
        <div className="flex gap-5 items-center justify-center w-fit h-fit">
          <img src={session?.user?.image!} className="w-10 rounded-lg " />
          <p className="text-lg font-bold">{session?.user?.name!}</p>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
            className="flex items-center justify-center">
            <button
              type="submit"
              className="border rounded-md px-2 text-xs border-stone-400 hover:bg-stone-600 hover:border-white transition-colors">
              Signout
            </button>
          </form>
        </div>
        <div>setting</div>
      </div>
      {/* play section */}
      <section className="mt-10">
        <div className="flex gap-3 items-center">
          <div className="w-20 h-20 bg-stone-700 flex items-center rounded-md justify-center">
            <Image src="/chess.png" alt="logo" width={32} height={15} />
          </div>
          <div>
            <p className="text-lg font-bold">Play</p>
            <p className="text-sm text-stone-500">Start a game</p>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto mt-4">
          <Link
            className="min-w-44 rounded-lg overflow-hidden flex flex-col items-center bg-stone-900 hover:bg-stone-700 transition-colors cursor-pointer border-b-4 border-black"
            href="/game">
            <Image src="/chessboard.png" alt="board" width={500} height={500} />
            <p className="text-sm py-3 font-bold">With Random Player</p>
          </Link>
          <Link
            className="min-w-44 rounded-lg overflow-hidden flex flex-col items-center bg-stone-900 hover:bg-stone-700 transition-colors cursor-pointer border-b-4 border-black"
            href="/game">
            <Image src="/chessboard.png" alt="board" width={500} height={500} />
            <p className="text-sm py-3 font-bold">With a Friend</p>
          </Link>
          <Link
            className="min-w-44 rounded-lg overflow-hidden flex flex-col items-center bg-stone-900 hover:bg-stone-700 transition-colors cursor-pointer border-b-4 border-black"
            href="/game">
            <Image src="/chessboard.png" alt="board" width={500} height={500} />
            <p className="text-sm py-3 font-bold">With Bot</p>
          </Link>
        </div>
      </section>

      {/* history games  */}
      <section className="mt-10 bg-stone-900 w-full rounded-md overflow-hidden">
        <div className="px-7 py-3">
          <h4 className="text-xl font-bold">Completed Games</h4>
        </div>
      </section>

      <p className="mt-4 text-sm test-stone-400">made by tanav</p>
    </div>
  );
}
