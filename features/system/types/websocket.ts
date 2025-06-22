export enum WebSocketStatus {
  CONNECTING = 'CONNECTING',
  OPEN = 'OPEN',
  CLOSING = 'CLOSING',
  CLOSED = 'CLOSED'
}

export interface WebSocketServiceOptions<T> {
  reconnectDelay?: number
  maxReconnectAttempts?: number
  initialHandshake?: string

  onMessage?: (message: T) => void
  onStatusChange?: (status: WebSocketStatus) => void
}
