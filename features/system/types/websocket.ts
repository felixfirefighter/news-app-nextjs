export enum WebSocketStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
  RECONNECTING = 'reconnecting'
}

export interface WebSocketState {
  status: WebSocketStatus
  error?: string
  lastConnectedAt?: number
  reconnectAttempts: number
}

export interface WebSocketServiceConfig<T> {
  url: string
  reconnectDelay?: number
  maxReconnectAttempts?: number
  initialHandshake?: string

  onMessage: (data: T) => void
  onStatusChange: (status: WebSocketStatus, error?: string) => void
}
