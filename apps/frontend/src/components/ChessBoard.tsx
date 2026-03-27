import { Chess, Color, PieceSymbol, Square } from "chess.js";
import Image from "next/image";
import { useState } from "react";

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
  const [moveAudio] = useState<HTMLAudioElement>(() => new Audio("/move-self.mp3"));
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
        }),
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

  const orientedRows = isFlipped ? [...board].reverse() : board;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-stone-950/60 p-3 shadow-[0_28px_60px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
      <div className="overflow-hidden rounded-[1.5rem] ring-1 ring-white/5">
        {orientedRows.map((row, rowIndex) => {
          const rank = isFlipped ? rowIndex + 1 : 8 - rowIndex;
          const orientedCols = isFlipped ? [...row].reverse() : row;

          return (
            <div key={rank} className="flex">
              {orientedCols.map((square, colIndex) => {
                const file = isFlipped ? 7 - (colIndex % 8) : colIndex % 8;
                const squareRepresentation = (String.fromCharCode(97 + file) + "" + rank) as Square;
                const isOrigin = from === squareRepresentation;
                const isTarget = hoveredSquare === squareRepresentation && draggedSquare;

                return (
                  <div
                    key={squareRepresentation}
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
                    className={`relative flex h-[3.75rem] w-[3.75rem] select-none transition-[transform,filter] duration-200 ease-out sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem] ${
                      (rank + file) % 2 === 0 ? "bg-chess-light" : "bg-chess-dark"
                    } ${
                      isTarget
                        ? "ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-stone-950"
                        : ""
                    } ${
                      isOrigin ? "ring-2 ring-amber-400/60 ring-offset-2 ring-offset-stone-950" : ""
                    }`}
                  >
                    {started && (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="flex h-full flex-col items-center justify-center">
                          {square && (
                            <Image
                              alt="piece"
                              loading="eager"
                              className="w-12 cursor-pointer select-none active:cursor-grabbing sm:w-14 md:w-16"
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
    </div>
  );
};
