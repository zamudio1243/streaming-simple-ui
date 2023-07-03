import io from "socket.io-client";

const endpoint =
  import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:3000";

const namespace = `${endpoint}/stream`;

const socket = io(namespace, {
  transports: ["websocket"],
  auth: { id: "1234" },
});
socket.off;

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
