export enum ClientEvent {
  USER_JOIN = "user-join",
  USER_LEAVE = "user-leave",
  SEND_OFFER = "send-offer",
  SEND_MESSAGE = "send-message",
  SEND_ICE_CANDIDATE = "send-ice-candidate",
  RECEIVE_OFFER = "receive-offer",
  NEW_STREAM = "new-stream",
  SEND_ANSWER = "send-answer",
  // RECEIVE_ANSWER = "receive-answer",
}

export enum ServerEvent {
  USERS = "users",
  OFFER = "offer",
  MESSAGE = "message",
  ICE_CANDIDATE = "ice-candidate",
  STREAMS = "streams",
  ANSWER = "answer",
}
