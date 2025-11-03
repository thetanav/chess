import { WebSocket } from "ws";
import { INIT_GAME, MOVE, OPPONENT_DISCONNECTED } from "./messages";
import { Game } from "./Game";

interface User {
  email: string;
  socket: WebSocket;
}

export class GameManager {
  private games: Game[];
  private pendingUser: User | null;
  private users: User[];

  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(data: User) {
    this.users.push(data);
    this.handleMessage(data);
  }

  removeUser(socket: WebSocket) {
    // remove pending user if this was pending
    if (this.pendingUser?.socket === socket) this.pendingUser = null;

    this.users = this.users.filter((user) => user.socket !== socket);
    this.games.filter((game) => {
      if (game.player1.socket === socket || game.player2.socket === socket) {
        // notify the other player that the game has ended
        const otherPlayerSocket =
          game.player1.socket === socket
            ? game.player2.socket
            : game.player1.socket;
        otherPlayerSocket.send(
          JSON.stringify({
            type: OPPONENT_DISCONNECTED,
            payload: { message: "Opponent Disconnected" },
          })
        );
        return false; // remove this game
      }
      return true; // keep this game
    });
  }

  private handleMessage(user: User) {
    user.socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      if (message.type === INIT_GAME) {
        if (this.pendingUser) {
          const game = new Game(this.pendingUser, user);
          this.games.push(game);
          this.pendingUser = null;
        } else {
          this.pendingUser = user;
        }
      }

      if (message.type === MOVE) {
        const game = this.games.find(
          (game) =>
            game.player1.socket === user.socket ||
            game.player2.socket === user.socket
        );
        if (game) {
          game.makeMove(user.socket, message.payload);
        }
      }
    });
  }
}
