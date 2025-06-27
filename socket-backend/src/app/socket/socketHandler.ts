import { Socket, Server as SocketIoServer } from "socket.io";

// Event
const EVENT_MESSAGE = "message";
const EVENT_ERROR = "error";
const EVENT_ONLINE_USERS = "onlineUsers";

// Types
interface UserSocketMap {
  [email: string]: string; // khalid@gmail.com : socket-unique-id
}

// Variables
let userSocketMap: UserSocketMap = {};
let io: SocketIoServer;

// Functions
const getReciverSocketId = (email: string): string | null => {
  return userSocketMap[email] || null;
};

export async function initializeSocket(socketServer: SocketIoServer) {
  io = socketServer;

  io.on("connection", async (socket: Socket) => {
    const socketId = socket?.id;
    const email = socket.handshake.query.email as string;

    userSocketMap[email] = socketId;

    // console.log(userSocketMap, 'user socket map')
    console.log(email, "connected");

    socket.on(
      EVENT_MESSAGE,
      async (data: {
        senderEmail: string;
        content: string;
        receiverEmail: string;
      }) => {
        console.log(data);
        const { receiverEmail } = data;

        // save the message in db

        // send the message to the receiver
        const receiverSocketId = getReciverSocketId(receiverEmail);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(EVENT_MESSAGE, {
            data,
          });
        }
      }
    );

    socket.on("disconnect", async () => {
      console.log("Disconnected", socket?.id);

      delete userSocketMap[email];

      console.log(email, "disconnecte");

      // console.log(userSocketMap, 'from disconnected')
    });
  });
}
