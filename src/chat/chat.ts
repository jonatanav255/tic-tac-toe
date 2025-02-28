// src/chat/chat.ts
import { Server } from "socket.io";
import * as http from "http";


const server = http.createServer();
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for incoming chat messages from the client
  socket.on("chatMessage", (msg: string) => {
    // Broadcast the chat message to all connected clients
    io.emit("chatMessage", msg);
  });

  // You can also integrate this with your Tic Tac Toe events if needed
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
