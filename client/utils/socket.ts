import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

console.log("Connecting socket to:", SOCKET_URL); // DEBUG

const socket = io(SOCKET_URL!, {
  //   transports: ["websocket"],
});

export default socket;
