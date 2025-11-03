import { Chess, Color, PieceSymbol, Square } from "chess.js";
import Image from "next/image";
import { useEffect, useState } from "react";
// @ts-ignore
import Piece from "react-chess-pieces";
import toast from "react-hot-toast";

const MOVE = "move";

export const ChessBoard = ({
  chess,
  board,
  socket,
  setBoard,
  setMoves,
  started,
  setMyChance,
  mychance,
  isFlipped, // white -> false
}: {
  chess: Chess;
  setBoard: React.Dispatch<
    React.SetStateAction<
      ({
        square: Square;
        type: PieceSymbol;
        color: Color;
      } | null)[][]
    >
  >;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  setMoves: any;
  setMyChance: any;
  started: boolean;
  mychance: boolean;
  isFlipped: boolean;
}) => {
  const [from, setFrom] = useState<null | Square>(null);
  const [moveAudio] = useState<HTMLAudioElement>(
    () => new Audio("/move-self.mp3")
  );
  const [draggedSquare, setDraggedSquare] = useState<null | Square>(null);
  const [hoveredSquare, setHoveredSquare] = useState<null | Square>(null);

  const handleMove = (fromSquare: Square, toSquare: Square) => {
    try {
      chess.move({
        from: fromSquare,
        to: toSquare,
      });
      if (moveAudio) moveAudio.play();
      setBoard(chess.board());
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: {
            from: fromSquare,
            to: toSquare,
          },
        })
      );
      setMoves((prev: any) => [
        ...prev,
        {
          from: fromSquare,
          to: toSquare,
        },
      ]);
      setMyChance(false);
      setFrom(null);
    } catch (error: any) {
      // Invalid move
    }
  };

  // show messages like check, attacked

  return (
    <div className="rounded-md overflow-hidden bg-black">
      {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
        i = isFlipped ? i + 1 : 8 - i;
        return (
          <div key={i} className="flex">
            {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
              j = isFlipped ? 7 - (j % 8) : j % 8;

              const squareRepresentation = (String.fromCharCode(97 + j) +
                "" +
                i) as Square;

              return (
                <div
                  onClick={() => {
                    if (from) {
                      handleMove(from, squareRepresentation);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedSquare) {
                      setHoveredSquare(squareRepresentation);
                    }
                  }}
                  onDragLeave={() => {
                    setHoveredSquare(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setHoveredSquare(null);
                    if (draggedSquare && mychance) {
                      handleMove(draggedSquare, squareRepresentation);
                      setDraggedSquare(null);
                    }
                  }}
                  key={j}
                  className={`w-[4rem] sm:w-16 md:w-[4.5rem] h-[4rem] sm:h-16 md:h-[4.5rem] select-none relative hover:brightness-[0.9] transition-all ${
                    (i + j) % 2 === 0 ? "bg-chess-light" : "bg-chess-dark"
                  } ${hoveredSquare === squareRepresentation && draggedSquare ? "brightness-[0.8]" : ""}`}>
                  {started && (
                    <div className="w-full justify-center items-center flex h-full">
                      <div className="h-full justify-center items-center flex flex-col">
                        {square && (
                          <Image
                            alt="piece"
                            loading="eager"
                            className="md:w-20 sm:w-16 w-[3.5rem] cursor-normal active:cursor-grabbing origin-center"
                            width={1000}
                            height={1000}
                            src={`/pieces/${square.color + square.type}.png`}
                            quality={100}
                            draggable={mychance}
                            onDragStart={(e) => {
                              if (mychance) {
                                setDraggedSquare(squareRepresentation);
                                setFrom(squareRepresentation);
                                e.dataTransfer.effectAllowed = "move";
                              } else {
                                e.preventDefault();
                              }
                            }}
                            onDragEnd={() => {
                              setDraggedSquare(null);
                            }}
                            onClick={() => {
                              if (mychance) {
                                setFrom(squareRepresentation);
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
