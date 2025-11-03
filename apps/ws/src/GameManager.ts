import { WebSocket } from "ws";
import { INIT_GAME, MOVE } from "./messages";
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
    // remove pendig user if this was pending
    if (this.pendingUser?.socket === socket) this.pendingUser = null;
    this.users.filter((user) => user.socket !== socket);
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
