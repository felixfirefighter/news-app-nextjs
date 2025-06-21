import {
  WebSocketServiceConfig,
  WebSocketStatus
} from '@/features/system/types/websocket'

export class WebSocketService<T> {
  private ws: WebSocket | null = null
  private config: WebSocketServiceConfig<T>
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isManualClose = false

  constructor(config: WebSocketServiceConfig<T>) {
    this.config = {
      ...config,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5
    }
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.isManualClose = false
    this.config.onStatusChange(WebSocketStatus.CONNECTING)

    try {
      this.ws = new WebSocket(this.config.url)
      this.attachEventListeners()
    } catch (error) {
      this.handleError(
        error instanceof Error ? error.message : 'Connection failed'
      )
    }
  }

  disconnect(): void {
    this.isManualClose = true
    this.clearReconnectTimeout()

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }

    this.config.onStatusChange(WebSocketStatus.DISCONNECTED)
  }

  send(data: string): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
      return true
    }
    return false
  }

  getStatus(): WebSocketStatus {
    if (!this.ws) return WebSocketStatus.DISCONNECTED

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return WebSocketStatus.CONNECTING
      case WebSocket.OPEN:
        return WebSocketStatus.CONNECTED
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return this.reconnectAttempts > 0
          ? WebSocketStatus.RECONNECTING
          : WebSocketStatus.DISCONNECTED
      default:
        return WebSocketStatus.DISCONNECTED
    }
  }

  private attachEventListeners(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.config.onStatusChange(WebSocketStatus.CONNECTED)

      if (this.config.initialHandshake) {
        this.ws?.send(this.config.initialHandshake)
      }
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        this.config.onMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.handleError('WebSocket connection error')
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)

      if (!this.isManualClose && this.shouldReconnect()) {
        this.scheduleReconnect()
      } else {
        this.config.onStatusChange(WebSocketStatus.DISCONNECTED)
      }
    }
  }

  private handleError(errorMessage: string): void {
    this.config.onStatusChange(WebSocketStatus.ERROR, errorMessage)

    if (this.shouldReconnect()) {
      this.scheduleReconnect()
    }
  }

  private shouldReconnect(): boolean {
    return this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    this.config.onStatusChange(WebSocketStatus.RECONNECTING)

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, this.config.reconnectDelay)
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }
}
