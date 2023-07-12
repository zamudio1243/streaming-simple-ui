import "./style.css";
import socket from "./socket";

// HTML elements
const startCamButton = document.getElementById(
  "webcamButton"
) as HTMLButtonElement;
const streamVideo = document.getElementById("stream-video") as HTMLVideoElement;
const startStreamBtn = document.getElementById(
  "stream-start-buttom"
) as HTMLButtonElement;
const messageButton = document.getElementById(
  "message-buttom"
) as HTMLButtonElement;
const joinStreamButton = document.getElementById(
  "join-stream-button"
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
const messageList = document.getElementById("message-list") as HTMLUListElement;

// webRTC
const peerConnection = new RTCPeerConnection(servers);

// Streams
let mediaStream: MediaStream | null = null;

let amIOffer = false;

// Socket events
socket.on("users", (payload: any) => {
  const users = payload.length - 1;
  usersCount.textContent = users.toString();
});

socket.on("message", (payload: any) => {
  const listItem = document.createElement("li");
  listItem.textContent = payload.message;
  messageList.appendChild(listItem);
});

// Listen for answer
socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
  if (!amIOffer) return;
  console.log("listening answer", answer);
  if (!peerConnection.currentRemoteDescription) {
    const answerDescription = new RTCSessionDescription(answer);
    peerConnection.setRemoteDescription(answerDescription);
  }
});

// Listen for offer
socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
  if (amIOffer) return;
  console.log("listening offer", offer);
  const offerDescription = new RTCSessionDescription(offer);
  await peerConnection.setRemoteDescription(offerDescription);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("send-answer", answer);
});

socket.on("ice-candidate", async (payload: any) => {
  console.log(
    `listening ice-candidate from ${payload.isOffer ? "offer" : "answer"}`
  );
  if (payload.isOffer && amIOffer) return;
  const candidate = new RTCIceCandidate(payload.candidate);
  await peerConnection.addIceCandidate(candidate);
});

// Buttons actions

// Create offer
startStreamBtn.onclick = async () => {
  amIOffer = true;
  const input = document.getElementById("stream-id-input") as HTMLInputElement;
  const streamId = input.value;
  socket.emit("join", streamId);
  messageButton.disabled = false;

  // Get candidates for caller, then emit offer
  peerConnection.onicecandidate = (event) => {
    event.candidate &&
      socket.emit("send-ice-candidate", {
        candidate: event.candidate,
        isOffer: true,
      });
  };

  // Create offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("send-offer", offer);
};

// Join stream
joinStreamButton.onclick = async () => {
  amIOffer = false;
  const input = document.getElementById(
    "join-stream-input"
  ) as HTMLInputElement;
  const streamId = input.value;

  socket.emit("join", streamId);
  socket.emit("receive-offer");

  peerConnection.onicecandidate = (event) => {
    event.candidate &&
      socket.emit("send-ice-candidate", {
        candidate: event.candidate,
        isOffer: false,
      });
  };

  mediaStream = new MediaStream();
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      mediaStream?.addTrack(track);
    });
  };

  streamVideo.srcObject = mediaStream;

  startStreamBtn.disabled = true;
  messageButton.disabled = false;
};

messageButton.onclick = async () => {
  const input = document.getElementById("message-input") as HTMLInputElement;
  if (input.value === "") return;
  const message = input.value;
  socket.emit("send-message", { message });
  input.value = "";
};

// Set up media stream
startCamButton.onclick = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    mediaStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, mediaStream as MediaStream);
    });

    streamVideo.srcObject = mediaStream;
    startStreamBtn.disabled = false;
    startCamButton.disabled = true;
  } catch (error) {
    console.error(error);
    mediaStream = null;
  }

  // Assign streams to corresponding components
  streamVideo.srcObject = mediaStream;
  startStreamBtn.disabled = false;
  joinStreamButton.disabled = true;
  startCamButton.disabled = true;
};
