import "./style.css";
import socket from "./socket";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const messageList = document.getElementById("message-list");

const staticMessages = ["Bienvenido!", "Hola a todos", "¿Cómo están?"];

staticMessages.forEach((message) => {
  const listItem = document.createElement("li");
  listItem.textContent = message;
  messageList.appendChild(listItem);
});

let localStream = null;

// HTML elements
const webcamButton = document.getElementById("webcamButton");
const webcamVideo = document.getElementById("webcamVideo");
const callButton = document.getElementById("callButton");
const answerButton = document.getElementById("answerButton");

webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .catch((e) => {
      console.table(e);
    });

  // Asignacionn de los stream a su componente correspondiente
  webcamVideo.srcObject = localStream;
  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
};

callButton.onclick = async () => {};

answerButton.onclick = async () => {};
