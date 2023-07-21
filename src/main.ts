import "./style.css";
import socket from "./socket";
import { v4 as uuidv4 } from "uuid";
import { ClientEvent, ServerEvent } from "./events";
import { log } from "console";

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

// Listen for create offer
socket.on(ServerEvent.CREATE_OFFER, async (payload: any) => {
  console.log("I have to create and send offer", payload);
  const { targetSocketId } = payload;
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit(ClientEvent.SEND_OFFER, {
    offer,
    targetSocketId,
  });
  // Get candidates for caller, then ice - candidate
  peerConnection.onicecandidate = (event) => {
    event.candidate &&
      socket.emit(ClientEvent.SEND_ICE_CANDIDATE, {
        candidate: event.candidate,
        targetSocketId,
      });
  };
});

// Listen for receive offer
socket.on(ServerEvent.OFFER, async (offer: RTCSessionDescriptionInit) => {
  console.log("listening offer", offer);
  const offerDescription = new RTCSessionDescription(offer);
  await peerConnection.setRemoteDescription(offerDescription);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit(ClientEvent.SEND_ANSWER, { answer, targetSocketId: socket.id });
});

socket.on(ServerEvent.ANSWER, async (payload: any) => {
  console.log("listening answer");
  const { answer, targetSocketId } = payload;
  if (!peerConnection.currentRemoteDescription) {
    const answerDescription = new RTCSessionDescription(answer);
    peerConnection.setRemoteDescription(answerDescription);
  }
});

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

// listen for ice-candidate
socket.on(ServerEvent.ICE_CANDIDATE, async (payload: any) => {
  const areFromOffer = payload.targetSocketId === socket.id;
  console.log(
    `${areFromOffer ? "offer send me" : "user send me his"} ice-candidates`,
    payload
  );
  const candidate = new RTCIceCandidate(payload.candidate);
  await peerConnection.addIceCandidate(candidate);
});

// Buttons actions
// Start stream
startStreamBtn.onclick = async () => {
  const id = uuidv4();
  socket.emit(ClientEvent.JOIN_STREAM, id);
  socket.emit(ClientEvent.START_STREAM);
  streamIdElement.textContent = `Stream ID: ${id}`;
  leaveButton.disabled = false;
};

// Join stream
joinStreamButton.onclick = async () => {
  const input = document.getElementById(
    "join-stream-input"
  ) as HTMLInputElement;
  const streamId = input.value;
  socket.emit(ClientEvent.JOIN_STREAM, streamId);

  peerConnection.onicecandidate = (event) => {
    event.candidate &&
      socket.emit(ClientEvent.SEND_ICE_CANDIDATE, {
        candidate: event.candidate,
        targetSocketId: socket.id,
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
  socket.emit(ClientEvent.LEAVE_STREAM);
};
