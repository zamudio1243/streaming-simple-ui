import "./style.css";
import socket from "./socket";

// Streams
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;

// HTML elements
const webcamButton = document.getElementById(
  "webcamButton"
) as HTMLButtonElement;
const webcamVideo = document.getElementById("webcamVideo") as HTMLVideoElement;
const startStreamBtn = document.getElementById(
  "stream-start-buttom"
) as HTMLButtonElement;

const messageButton = document.getElementById(
  "message-buttom"
) as HTMLButtonElement;
const answerButton = document.getElementById(
  "answerButton"
) as HTMLButtonElement;
const usersCount = document.getElementById("users") as HTMLElement;

// Constants
const servers: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};
const peerConnection = new RTCPeerConnection(servers);
let streamId: string | null = null;

const messageList = document.getElementById("message-list") as HTMLUListElement;

// Socket events
socket.on("users", (payload: any) => {
  usersCount.textContent = [payload].length.toString();
});

socket.on("message", (payload: any) => {
  console.log(payload);
  const listItem = document.createElement("li");
  listItem.textContent = payload.message;
  messageList.appendChild(listItem);
});

// Buttons actions
startStreamBtn.onclick = async () => {
  const input = document.getElementById("stream-id-input") as HTMLInputElement;
  streamId = input.value;
  socket.emit("join", streamId);
};

messageButton.onclick = async () => {
  const input = document.getElementById("message-input") as HTMLInputElement;
  if (input.value === "") return;
  const message = input.value;
  socket.emit("send-message", { message });
  input.value = "";
};

webcamButton.onclick = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    webcamVideo.srcObject = localStream;
    startStreamBtn.disabled = false;
    answerButton.disabled = false;
    webcamButton.disabled = true;
  } catch (error) {
    console.error(error);
    localStream = null;
  }

  // Assign streams to corresponding components
  webcamVideo.srcObject = localStream;
  startStreamBtn.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
};
