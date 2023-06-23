import "./style.css";
let localStream = null;
// HTML elements
const webcamButton = document.getElementById("webcamButton");
const webcamVideo = document.getElementById("webcamVideo");
const callButton = document.getElementById("callButton");
const answerButton = document.getElementById("answerButton");


webcamButton.onclick = async () => {
  localStream = await navigator.mediaDevices
    .getUserMedia({ audio: true, video: true})
    .catch((e) => {
      console.table(e);
    });

  // Asignacionn de los stream a su componente correspondiente
  webcamVideo.srcObject = localStream;
  callButton.disabled = false;
  answerButton.disabled = false;
  webcamButton.disabled = true;
};


callButton.onclick = async () => {}

answerButton.onclick = async () => {}
