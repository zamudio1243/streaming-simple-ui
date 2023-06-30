require("dotenv").config();

const endpoint = process.env.SOCKET_ENDPOINT || "http://localhost:3000";
const stream_endpoint = `${endpoint}/stream `;

const socket = io(stream_endpoint, {
  transports: ["websocket"],
  auth: { id: "1234" },
});

export default { socket };
