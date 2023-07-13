import "./style.css";
import socket from "./socket";
import { v4 as uuidv4 } from "uuid";
import { ClientEvent, ServerEvent } from "./events";

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
const leaveButton = document.getElementById("leaveButton") as HTMLButtonElement;
const usersCount = document.getElementById("users") as HTMLElement;
const streamIdElement = document.getElementById("stream-id") as HTMLElement;
const messageList = document.getElementById("message-list") as HTMLUListElement;
const streamList = document.getElementById("streams-list") as HTMLUListElement;

// Constants
const servers: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

// webRTC
const peerConnection = new RTCPeerConnection(servers);

// Streams
let mediaStream: MediaStream | null = null;

// Socket events
socket.on(ServerEvent.USERS, (payload: any) => {
  const users = payload.length - 1;
  usersCount.textContent = users.toString();
});

socket.on(ServerEvent.MESSAGE, (payload: any) => {
  const listItem = document.createElement("li");
  listItem.textContent = payload.message;
  messageList.appendChild(listItem);
});

socket.on(ServerEvent.STREAMS, (payload: string[]) => {
  console.log("listening streams", payload);
  while (streamList.firstChild) {
    streamList.removeChild(streamList.firstChild);
  }
  payload.forEach((stream) => {
    const listItem = document.createElement("li");
    listItem.textContent = stream;
    streamList.appendChild(listItem);
  });
});

// Listen for answer
socket.on(ServerEvent.ANSWER, async (answer: RTCSessionDescriptionInit) => {
  console.log("listening answer", answer);
  if (!peerConnection.currentRemoteDescription) {
    const answerDescription = new RTCSessionDescription(answer);
    peerConnection.setRemoteDescription(answerDescription);
  }
});

// Listen for offer
socket.on(ServerEvent.OFFER, async (offer: RTCSessionDescriptionInit) => {
  console.log("listening offer", offer);
  const offerDescription = new RTCSessionDescription(offer);
  await peerConnection.setRemoteDescription(offerDescription);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit(ClientEvent.SEND_ANSWER, answer);
});

// listen for ice-candidate
socket.on(ServerEvent.ICE_CANDIDATE, async (payload: any) => {
  console.log(
    `listening ice-candidate from ${payload.isOffer ? "offer" : "answer"}`
  );
  const candidate = new RTCIceCandidate(payload.candidate);
  await peerConnection.addIceCandidate(candidate);
});

// Buttons actions
// Create offer
startStreamBtn.onclick = async () => {
  const id = uuidv4();
  socket.emit(ClientEvent.USER_JOIN, id);
  streamIdElement.textContent = `Stream ID: ${id}`;

  // Get candidates for caller, then emit offer
  peerConnection.onicecandidate = (event) => {
    event.candidate &&
      socket.emit(ClientEvent.SEND_ICE_CANDIDATE, {
        candidate: event.candidate,
        isOffer: true,
      });
  };

  // Create offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit(ClientEvent.SEND_OFFER, offer);
  socket.emit(ClientEvent.NEW_STREAM);
  leaveButton.disabled = false;
};

// Join stream
joinStreamButton.onclick = async () => {
  const input = document.getElementById(
    "join-stream-input"
  ) as HTMLInputElement;
  const streamId = input.value;
  socket.emit(ClientEvent.USER_JOIN, streamId);
  socket.emit(ClientEvent.RECEIVE_OFFER);

  peerConnection.onicecandidate = (event) => {
    event.candidate &&
      socket.emit(ClientEvent.SEND_ICE_CANDIDATE, {
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
  messageButton.disabled = false;
  startStreamBtn.disabled = true;
  leaveButton.disabled = false;
};

messageButton.onclick = async () => {
  const input = document.getElementById("message-input") as HTMLInputElement;
  if (input.value === "") return;
  const message = input.value;
  socket.emit(ClientEvent.SEND_MESSAGE, { message });
  input.value = "";
};

// Set up media stream
startCamButton.onclick = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true /*, video: true */,
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

leaveButton.onclick = async () => {
  socket.emit(ClientEvent.USER_LEAVE);
};