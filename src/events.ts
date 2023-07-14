export enum ClientEvent {
  JOIN_STREAM = "join-stream",
  LEAVE_STREAM = "leave-stream",
  START_STREAM = "start-stream",
  SEND_OFFER = "send-offer",
  SEND_MESSAGE = "send-message",
  SEND_ICE_CANDIDATE = "send-ice-candidate",
  SEND_ANSWER = "send-answer",
}

export enum ServerEvent {
  USERS = "users",
  OFFER = "offer",
  ANSWER = "answer",
  CREATE_OFFER = "create-offer",
  ICE_CANDIDATE = "ice-candidate",
  STREAMS = "streams",
  MESSAGE = "message",
}
