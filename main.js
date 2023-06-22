import "./style.css";

let localStream = null;
// HTML elements
const webcamButton = document.getElementById("webcamButton");
const webcamVideo = document.getElementById("webcamVideo");
const callButton = document.getElementById("callButton");
const answerButton = document.getElementById("answerButton");

// 1. Setup media sources
webcamButton.onclick = async () => {
  // Solicita al navegador acceso a la camara y al microfono
  // configurando con este, nuestro stream de datos
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

// 2. Create an offer
callButton.onclick = async () => {}

// 3. Answer the call with the unique ID
answerButton.onclick = async () => {}
