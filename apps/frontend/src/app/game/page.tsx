"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
import { GameStatus, GameStartOverlay } from "@/components/GameStatus";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { UserInfo, UserImage } from "@/components/UserInfo";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import Image from "next/image";
import { motion } from "framer-motion";

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
  const [gameStatus, setGameStatus] = useState("waiting");
  const [isInCheck, setIsInCheck] = useState(false);
  const [isCheckmate, setIsCheckmate] = useState(false);
  const [isStalemate, setIsStalemate] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  const [showGameOverlay, setShowGameOverlay] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
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
          setGameStatus("ready");
          setShowGameOverlay(true);
          setTimeout(() => setShowGameOverlay(false), 2000);
          toast.success("Match started! Good luck!", {
            icon: "♔",
            duration: 3000,
          });
          break;
        }
        case MOVE: {
          const move = message.payload;
          chess.move(move);
          setMoves((prev) => [...prev, move]);
          setBoard(chess.board());
          setMyChance((prev) => !prev);
          setLastMove(move);
          
          // Enhanced game state detection
          const check = chess.isCheck();
          const checkmate = chess.isCheckmate();
          const stalemate = chess.isStalemate();
          const draw = chess.isDraw();
          
          setIsInCheck(check);
          setIsCheckmate(checkmate);
          setIsStalemate(stalemate);
          setIsDraw(draw);
          
          if (check) {
            captureAudio?.play();
            setGameStatus("check");
            toast.error("⚠️ You're in check!", {
              icon: "🚨",
              duration: 4000,
            });
          }
          if (checkmate) {
            captureAudio?.play();
            setGameStatus("checkmate");
            toast.error("♔♕ Checkmate!", {
              icon: "👑",
              duration: 6000,
            });
          }
          if (stalemate) {
            captureAudio?.play();
            setGameStatus("stalemate");
            toast("🤝 Stalemate - It's a draw!", {
              icon: "🤝",
              duration: 6000,
            });
          }
          if (draw) {
            captureAudio?.play();
            setGameStatus("draw");
            toast("🤝 Game ends in a draw", {
              icon: "🤝",
              duration: 6000,
            });
          }
          
          // Reset check status if not in check
          if (!check) {
            setTimeout(() => setIsInCheck(false), 1000);
          }
          
          moveAudio?.play();
          break;
        }
        case GAME_OVER: {
          setStarted(false);
          setWinner(message.payload);
          setGameStatus("game_over");
          setShowGameOverlay(true);
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

  if (!socket) return (
    <div className="flex items-center justify-center min-h-screen bg-stone-900">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-t-4 border-t-white border-4 border-transparent rounded-full"
      />
      <span className="ml-4 text-white text-lg">Connecting to server...</span>
    </div>
  );

  return (
    <div className="justify-center flex items-center min-h-screen w-screen bg-stone-900 relative">
      {/* Game Status Notifications */}
      <GameStatus
        gameStatus={gameStatus}
        setGameStatus={setGameStatus}
        isCheck={isInCheck}
        isCheckmate={isCheckmate}
        isStalemate={isStalemate}
        isDraw={isDraw}
      />

      {/* Game Start/End Overlay */}
      <GameStartOverlay
        showStart={showGameOverlay}
        onStart={() => {
          setShowGameOverlay(false);
          setWinner(null);
          setGameStatus("waiting");
          setMoves([]);
          setLastMove(null);
          chess.reset();
          setBoard(chess.board());
        }}
        winner={winner}
      />

      <div className="flex gap-8 items-center justify-center lg:flex-row flex-col">
        <div className="flex flex-col gap-2 py-16 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {opponent && <UserInfo id={opponent} />}
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
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
              gameStatus={gameStatus}
              setGameStatus={setGameStatus}
            />
            
            {/* Game Status Overlay */}
            {(isInCheck || isCheckmate || isStalemate || isDraw) && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`
                    px-6 py-3 rounded-xl font-bold text-lg
                    ${isCheckmate ? "bg-red-600 text-white" : "bg-yellow-600 text-white"}
                  `}
                >
                  {isCheckmate && "♔♕ CHECKMATE!"}
                  {isInCheck && "⚠️ CHECK!"}
                  {isStalemate && "🤝 STALEMATE"}
                  {isDraw && "🤝 DRAW"}
                </motion.div>
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {you && <UserInfo id={you} />}
          </motion.div>
        </div>

        {/* Enhanced side panel */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-96 bg-gradient-to-b from-stone-800 to-stone-900 md:border-l border-stone-500 rounded-lg shadow-2xl overflow-hidden"
        >
          {!started ? (
            <div className="flex items-center justify-center h-32">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-t-4 border-t-white border-4 border-transparent rounded-full"
              />
            </div>
          ) : (
            <div className="py-4 px-6">
              <div className="text-center mb-4">
                {opponent && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 }}
                  >
                    <UserImage
                      id={opponent}
                      color={color == "white" ? "black" : "white"}
                    />
                  </motion.div>
                )}
              </div>
              
              {/* Enhanced status display */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mb-4"
              >
                <div className={`
                  px-4 py-2 rounded-lg font-bold text-lg
                  ${mychance 
                    ? "bg-green-600 text-white" 
                    : "bg-blue-600 text-white"
                  }
                  ${gameStatus === "check" && "animate-pulse bg-red-600"}
                  ${gameStatus === "checkmate" && "animate-pulse bg-red-800"}
                `}>
                  {mychance ? "🎯 YOUR TURN" : "⏳ OPPONENT'S TURN"}
                </div>
                
                {gameStatus === "check" && (
                  <div className="mt-2 text-yellow-400 font-bold animate-bounce">
                    ⚠️ YOU'RE IN CHECK!
                  </div>
                )}
                
                {moves.length > 0 && (
                  <div className="mt-2 text-stone-400 text-sm">
                    Move {moves.length}
                  </div>
                )}
              </motion.div>

              {/* Enhanced move history */}
              <div className="bg-stone-700/50 rounded-lg p-3">
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  📜 Move History
                </h3>
                <ol className="list-decimal h-80 overflow-y-scroll space-y-1">
                  {moves.map((move, index) => (
                    <motion.li
                      key={move.from + move.to}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        text-sm text-stone-300 flex items-center justify-between
                        px-2 py-1 rounded hover:bg-stone-600/50
                        ${lastMove?.from === move.from && lastMove?.to === move.to
                          ? "bg-blue-600/30 border-l-4 border-blue-400"
                          : ""
                        }
                      `}
                    >
                      <span className="font-mono font-semibold">{index + 1}.</span>
                      <span className="font-mono">{move.from}</span>
                      <span className="text-stone-500">→</span>
                      <span className="font-mono">{move.to}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Game Lobby Overlay */}
      {!started && !showGameOverlay && (
        <div className="h-screen w-full bg-black/80 backdrop-blur-sm absolute top-0 left-0 flex justify-center items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-16 py-12 bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl flex flex-col items-center justify-center border border-stone-600"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              ♔♕
            </motion.div>
            <h1 className="text-4xl font-bold mb-6 text-white">Play Chess Online</h1>

            {winner && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col justify-center items-center mb-6 gap-4"
              >
                <Confetti width={width} height={height} recycle={false} />
                <div className="text-4xl">
                  {winner.winner === "DRAW" ? "🤝" : "👑"}
                </div>
                {winner.user && (
                  <UserImage id={winner.user} color={winner.winner} />
                )}
                <h3 className="text-2xl font-bold text-white uppercase">
                  {winner.winner === "DRAW"
                    ? "It's a draw!"
                    : `${winner.winner} wins`}
                </h3>
              </motion.div>
            )}

            {pending && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg text-stone-400 animate-pulse mb-4"
              >
                ⏳ Waiting for opponent...
              </motion.h3>
            )}

            {!pending && (
              <div className="flex justify-center items-center">
                {session.status == "loading" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-t-4 border-t-white border-4 border-transparent rounded-full"
                  />
                ) : (
                  <div>
                    {session.data?.user ? (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col gap-4 justify-end items-center"
                      >
                        <div className="flex gap-3 items-center">
                          {session.data.user.image && (
                            <Image
                              src={session.data.user.image}
                              alt="avatar"
                              width={40}
                              height={40}
                              className="rounded-full w-10 h-10 ring-2 ring-white/20"
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {session.data.user.name}
                            </h3>
                            <p className="text-sm text-stone-400">
                              Ready to play?
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-8 py-3 text-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl border-b-4 border-green-800 transition-all duration-200 shadow-lg"
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
                          }}
                        >
                          🎮 Start Game
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => signIn("google")}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg"
                      >
                        🔐 Sign in with Google
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}