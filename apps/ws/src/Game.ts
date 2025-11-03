import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { db } from "./db";

interface User {
  email: string;
  socket: WebSocket;
}

export class Game {
  public player1: User;
  public player2: User;
  public board: Chess;
  private startTime: Date;
  private moveCount = 0;
  private gameID: string;

  constructor(player1: User, player2: User) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.gameID = "";

    // make a game in db
    this.createToDb();

    this.player1.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
          you: player1.email,
          opponent: player2.email,
        },
      })
    );
    this.player2.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
          you: player2.email,
          opponent: player1.email,
        },
      })
    );
  }

  async createToDb() {
    const player1ID = await db.user.findUnique({
      where: {
        email: this.player1.email,
      },
      select: { id: true },
    });
    const player2ID = await db.user.findUnique({
      where: {
        email: this.player2.email,
      },
      select: { id: true },
    });
    // if either user is missing, don't attempt to create the game
    if (!player1ID || !player2ID) return;
    const game = await db.game.create({
      data: {
        status: "IN_PROGRESS",
        whitePlayer: { connect: { id: player1ID.id } },
        blackPlayer: { connect: { id: player2ID.id } },
      },
    });
    this.gameID = game.id;
  }

  async makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    // TODO: the user must know he is trying wrong move
    // first chance is of white or player 1

    // validate the type of move using zod
    if (this.moveCount % 2 === 0 && socket !== this.player1.socket) {
      // 0, 2, 4 ...
      return;
    }
    if (this.moveCount % 2 === 1 && socket !== this.player2.socket) {
      // 1, 3, 5 ...
      return;
    }

    try {
      this.board.move(move);
    } catch (e) {
      console.log(e);
      return;
    }

    if (this.moveCount % 2 === 0) {
      this.player2.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
    this.moveCount++;

    if (this.board.isGameOver()) {
      // Send the game over message to both players
      let winner: User;

      if (this.moveCount % 2 === 0) {
        winner = this.player2;
      } else {
        winner = this.player1;
      }

      // add it to db
      await db.game.update({
        where: {
          id: this.gameID,
        },
        data: {
          status: "COMPLETED",
          result: this.moveCount % 2 ? "WHITE_WINS" : "BLACK_WINS",
          endAt: new Date(),
          currentFen: this.board.fen(),
        },
      });

      this.player1.socket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
            user: winner.email,
          },
        })
      );
      this.player2.socket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
            user: winner.email,
          },
        })
      );
      return;
    }
  }
}
