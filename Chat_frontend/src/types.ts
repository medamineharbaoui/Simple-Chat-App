export interface UserLoggedInApiResponse {
  loggedIn: boolean,
}

export interface UserAuthApiResponse extends UserLoggedInApiResponse {
  userId: number,
  userName: string
}

export interface RegisterApiResponse {
  register: boolean;
}

export interface DataApiResponse<T> {
  data: T[]
}

export interface User {
  userId: number;
  userName: string;
  userIsOnline?: boolean;
}

export interface Message {
  messageId?: number
  messageSenderId?: number
  messageReceiverId: number
  messageText: string
}

export interface MessageApiResponse {
  sent: boolean
  messageId: number
  messageSenderId: number
  messageReceiverId: number
  messageText: string
}

export interface WebSocketApiMessage {
  status: number;
}


