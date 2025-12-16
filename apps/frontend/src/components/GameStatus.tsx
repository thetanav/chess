"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GameStatusProps {
  gameStatus: string;
  setGameStatus: (status: string) => void;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
}

export function GameStatus({
  gameStatus,
  setGameStatus,
  isCheck,
  isCheckmate,
  isStalemate,
  isDraw,
}: GameStatusProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    if (isCheck) {
      setNotificationMessage("⚠️ CHECK!");
      setGameStatus("check");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } else if (isCheckmate) {
      setNotificationMessage("♔♕ CHECKMATE!");
      setGameStatus("checkmate");
      setShowNotification(true);
    } else if (isStalemate) {
      setNotificationMessage("🤝 STALEMATE!");
      setGameStatus("stalemate");
      setShowNotification(true);
    } else if (isDraw) {
      setNotificationMessage("🤝 IT'S A DRAW!");
      setGameStatus("draw");
      setShowNotification(true);
    }
  }, [isCheck, isCheckmate, isStalemate, isDraw, setGameStatus]);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className={`
              px-8 py-4 rounded-2xl shadow-2xl font-bold text-xl
              ${isCheckmate
                ? "bg-gradient-to-r from-red-600 to-red-800 text-white animate-pulse"
                : isCheck
                ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                : "bg-gradient-to-r from-blue-600 to-purple-700 text-white"
              }
            `}
          >
            {notificationMessage}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface GameStartOverlayProps {
  showStart: boolean;
  onStart: () => void;
  winner?: {
    winner: string;
    user: string;
  } | null;
}

export function GameStartOverlay({ showStart, onStart, winner }: GameStartOverlayProps) {
  return (
    <AnimatePresence>
      {showStart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gradient-to-br from-stone-800 to-stone-900 p-12 rounded-3xl shadow-2xl border border-stone-600 text-center"
          >
            {winner ? (
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-6xl"
                >
                  {winner.winner === "DRAW" ? "🤝" : "👑"}
                </motion.div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  {winner.winner === "DRAW" ? "Game Over!" : `${winner.winner} Wins!`}
                </h2>
                <p className="text-stone-400 text-lg">Play again?</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStart}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
                >
                  New Game
                </motion.button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-6xl"
                >
                  ♔♕
                </motion.div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  Chess Match Ready!
                </h2>
                <p className="text-stone-400 text-lg">Prepare for battle...</p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 1 }}
                  className="h-1 bg-green-500 rounded-full"
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface GamePieceProps {
  piece: {
    square: string;
    type: string;
    color: string;
  } | null;
  isCheckSquare?: boolean;
  isLastMove?: boolean;
  children: React.ReactNode;
}

export function GamePiece({ piece, isCheckSquare, isLastMove, children }: GamePieceProps) {
  return (
    <div
      className={`
        w-full h-full flex items-center justify-center relative
        ${isCheckSquare ? "bg-red-500/30 animate-pulse" : ""}
        ${isLastMove ? "bg-blue-500/20" : ""}
      `}
    >
      {children}
      {isCheckSquare && (
        <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping" />
      )}
    </div>
  );
}