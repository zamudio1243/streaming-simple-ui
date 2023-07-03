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
const callButton = document.getElementById("callButton") as HTMLButtonElement;
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

webcamButton.onclick = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    webcamVideo.srcObject = localStream;
    callButton.disabled = false;
    answerButton.disabled = false;
    webcamButton.disabled = true;
  } catch (error) {
    console.error(error);
    localStream = null;
  }

  // Assign streams to corresponding components
  webcamVideo.srcObject = localStream;
  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
};

const onStart = () => {
  streamId = (document.getElementById("stream-id-input") as HTMLInputElement)
    .value;
  socket.emit("start", streamId);
};

socket.on("users", (users: any[]) => {
  usersCount.textContent = users.length.toString();
});

answerButton.onclick = async () => {};

const messageList = document.getElementById("message-list") as HTMLUListElement;

const staticMessages = ["Bienvenido!", "Hola a todos", "¿Cómo están?"];

staticMessages.forEach((message) => {
  const listItem = document.createElement("li");
  listItem.textContent = message;
  messageList.appendChild(listItem);
});
