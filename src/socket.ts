import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

const endpoint =
  import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:3000";
const namespace = `${endpoint}/stream`;

const socket = io(namespace, {
  transports: ["websocket"],
  auth: { id: uuidv4() },
});

socket.on("connect", () => {
  console.log("Conexión exitosa con el servidor");
});

socket.on("connect_error", (error) => {
  console.log("Error al conectar con el servidor:", error);
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
});

export default socket;
