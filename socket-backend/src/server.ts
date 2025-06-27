import { Server as HttpServer } from "http";
import app, { corsOptions } from "./app";
import config from "./config";
import {  Server as SocketIoServer } from "socket.io";
import { initializeSocket } from "./app/socket/socketHandler";

let server: HttpServer;
let io: SocketIoServer;


// Main function to start the server
async function main() {
  try {
    server = app.listen(config.port, () => {
      console.log("Server is running on port", config.port);
    });

    io = new SocketIoServer(server, {
      cors: corsOptions,
      pingTimeout: 60000 // 1 minute
    })

    await initializeSocket(io)
  } catch (error) {
    console.log(error);
  }
}

// Start the server
main();

process.on("unhandledRejection", (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
