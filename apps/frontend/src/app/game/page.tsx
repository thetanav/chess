"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { UserInfo, UserImage } from "@/components/UserInfo";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import Image from "next/image";

const INIT_GAME = "init_game";
const MOVE = "move";
const GAME_OVER = "game_over";
const INVALID_MOVE = "invalid_move";
const OPPONENT_DISCONNECTED = "opponent_disconnected";

export default function Game() {
  const socket = useSocket();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [mychance, setMyChance] = useState(false);
  const [winner, setWinner] = useState<{
    winner: string;
    user: string;
  }>();
  const [color, setColor] = useState("");
  const [pending, setPending] = useState(false);
  const [moves, setMoves] = useState<{ from: string; to: string }[]>([]);
  const [you, setYou] = useState("");
  const [opponent, setOpponent] = useState("");
  const [moveAudio] = useState<HTMLAudioElement | null>(() => {
    if (typeof window === "undefined" || typeof Audio === "undefined")
      return null;
    return new Audio("/move-self.mp3");
  });
  const [captureAudio] = useState<HTMLAudioElement | null>(() => {
    if (typeof window === "undefined" || typeof Audio === "undefined")
      return null;
    return new Audio("/capture.mp3");
  });
  const session = useSession();
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (!socket) return;

    const handler = (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case INIT_GAME: {
          setColor(message.payload.color);
          setYou(message.payload.you);
          setOpponent(message.payload.opponent);
          setBoard(chess.board());
          setStarted(true);
          setMyChance(message.payload.color === "white");
          toast.success("Match started.");
          break;
        }
        case MOVE: {
          const move = message.payload;
          chess.move(move);
          setMoves((prev) => [...prev, move]);
          setBoard(chess.board());
          setMyChance((prev) => !prev);
          if (chess.isCheck()) {
            captureAudio?.play();
            toast.error("You are in check");
          }
          if (chess.isCheckmate()) {
            captureAudio?.play();
            toast.error("Checkmate!");
          }
          if (chess.isStalemate()) {
            captureAudio?.play();
            toast.error("Stalemate");
          }
          moveAudio?.play();
          break;
        }
        case GAME_OVER: {
          setStarted(false);
          setWinner(message.payload);
          captureAudio?.play();
          break;
        }
        case OPPONENT_DISCONNECTED: {
          setStarted(false);
          toast.error(message.payload.message);
          break;
        }
        case INVALID_MOVE:
          toast.error(message.payload.message);
          break;
      }
    };

    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket, chess, captureAudio, moveAudio]);

  if (!socket)
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-stone-950 text-sm text-stone-300">
        Websocket is connecting...
      </div>
    );

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-stone-950 px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] rounded-b-[6rem] bg-gradient-to-b from-emerald-400/15 via-emerald-400/10 to-transparent blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-[28rem] text-center">
            {opponent && <UserInfo id={opponent} />}
          </div>
          <ChessBoard
            chess={chess}
            setBoard={setBoard}
            socket={socket}
            board={board}
            setMyChance={setMyChance}
            setMoves={setMoves}
            started={started}
            mychance={mychance}
            isFlipped={color == "white" ? false : true}
          />
          <div className="w-full max-w-[28rem] text-center">
            {you && <UserInfo id={you} />}
          </div>
        </div>

        <aside className="card w-full max-w-sm px-6 py-7">
          {!started ? (
            <div className="flex h-80 flex-col items-center justify-center gap-4 text-sm text-stone-400">
              <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Waiting for the game to begin…
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-stone-200">
                  {mychance ? "Your turn" : "Opponent turn"}
                </h2>
                {opponent && (
                  <UserImage
                    id={opponent}
                    color={color == "white" ? "black" : "white"}
                  />
                )}
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
                  Move log
                </p>
                <ol className="grid max-h-96 grid-cols-[1fr_auto_1fr] gap-x-4 gap-y-2 overflow-y-auto pr-1 text-sm text-stone-300">
                  {moves.map((move) => (
                    <li key={move.from + move.to} className="contents">
                      <span className="rounded-md bg-white/5 px-2 py-1 text-right font-semibold uppercase tracking-wide">
                        {move.from}
                      </span>
                      <span className="text-center text-xs text-stone-500">
                        →
                      </span>
                      <span className="rounded-md bg-white/5 px-2 py-1 font-semibold uppercase tracking-wide">
                        {move.to}
                      </span>
                    </li>
                  ))}
                  {moves.length === 0 && (
                    <span className="col-span-3 text-center text-xs text-stone-500">
                      Make the first move to populate the log.
                    </span>
                  )}
                </ol>
              </div>
            </div>
          )}
        </aside>
      </div>

      {!started && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="card w-full max-w-md px-10 py-9 text-center">
            <h1 className="text-2xl font-bold text-stone-100">
              Play chess online
            </h1>

            {winner && (
              <div className="mt-6 flex flex-col items-center gap-3">
                <Confetti width={width} height={height} recycle={false} />
                {winner.user && (
                  <UserImage id={winner.user} color={winner.winner} />
                )}
                <h3 className="text-lg font-semibold uppercase text-stone-100">
                  {winner.winner === "DRAW"
                    ? "It's a draw!"
                    : `${winner.winner} wins`}
                </h3>
              </div>
            )}

            {pending && (
              <p className="mt-6 text-sm text-stone-400">
                Waiting for another player to join…
              </p>
            )}

            {!pending && (
              <div className="mt-8 flex flex-col items-center gap-5">
                {session.status === "loading" ? (
                  <span className="inline-flex h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : session.data?.user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                      {session.data.user.image && (
                        <Image
                          src={session.data.user.image}
                          alt="avatar"
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-stone-200">
                        {session.data.user.name}
                      </span>
                    </div>
                    <button
                      className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-stone-950 shadow-[0_24px_50px_-28px_rgba(16,185,129,0.6)] transition-transform duration-200 hover:-translate-y-[2px] hover:bg-emerald-300"
                      onClick={() => {
                        socket.send(
                          JSON.stringify({
                            type: "LOGIN",
                            payload: {
                              id: session.data?.user?.id,
                            },
                          })
                        );
                        socket.send(
                          JSON.stringify({
                            type: INIT_GAME,
                          })
                        );
                        setPending(true);
                      }}>
                      Find a match
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => signIn("google")}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-stone-100 transition-colors hover:bg-white/10">
                    Sign in with Google
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
