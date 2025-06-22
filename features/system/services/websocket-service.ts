import {
  WebSocketServiceOptions,
  WebSocketStatus
} from '@/features/system/types/websocket'

/**
 * A WebSocket service with automatic reconnection and error handling.
 *
 * This service manages WebSocket connections with built-in reconnection logic,
 * status tracking, and automatic JSON message parsing. It handles connection
 * failures gracefully and provides a simple callback-based API for WebSocket communication.
 *
 * @template T - The type of messages expected from the WebSocket server
 *
 * @example
 * ```typescript
 * // Basic usage with chat messages
 * const chatService = new WebSocketService<ChatMessage>(
 *   (message) => console.log('Received:', message),
 *   (status) => console.log('Status:', status),
 *   {
 *     url: 'ws://localhost:8080/chat',
 *     reconnectDelay: 5000,
 *     maxReconnectAttempts: 3
 *   }
 * );
 *
 * chatService.connect();
 * chatService.send(JSON.stringify({ type: 'chat', text: 'Hello!' }));
 * ```
 *
 * @example
 * ```typescript
 * // With initial handshake for authentication
 * const apiService = new WebSocketService<ApiResponse>(
 *   (data) => handleApiResponse(data),
 *   (status) => updateConnectionStatus(status),
 *   {
 *     url: 'wss://api.example.com/ws',
 *     initialHandshake: JSON.stringify({ token: 'abc123' }),
 *     reconnectDelay: 2000,
 *     maxReconnectAttempts: 10
 *   }
 * );
 * ```
 */
export class WebSocketService<T> {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isManualClose = false

  private readonly url: string
  private readonly options: WebSocketServiceOptions<T>

  /**
   * Creates a new WebSocketService instance.
   *
   * @param url - WebSocket server URL
   * @param options - Configuration options for the WebSocket service
   * @param options.onMessage - Callback function for received messages (parsed as JSON)
   * @param options.onStatusChange - Callback function for connection status changes
   * @param options.reconnectDelay - Delay between reconnection attempts in milliseconds (default: 3000)
   * @param options.maxReconnectAttempts - Maximum number of reconnection attempts (default: 5)
   * @param options.initialHandshake - Optional message to send immediately after connection
   */
  constructor(url: string, options: WebSocketServiceOptions<T> = {}) {
    this.url = url
    this.options = {
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      ...options
    }
  }

  /**
   * Establishes a WebSocket connection to the configured server.
   *
   * If already connected, this method does nothing. Automatically triggers
   * status change callbacks and sets up event listeners for the connection.
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.isManualClose = false
    this.options.onStatusChange?.(WebSocketStatus.CONNECTING)

    try {
      this.ws = new WebSocket(this.url)
      this.attachEventListeners()
    } catch (error) {
      this.handleError()
    }
  }

  /**
   * Closes the WebSocket connection manually.
   *
   * Prevents automatic reconnection attempts and sets the status to CLOSED.
   * Use this when you intentionally want to terminate the connection.
   */
  disconnect(): void {
    this.isManualClose = true
    this.clearReconnectTimeout()

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }

    this.options.onStatusChange?.(WebSocketStatus.CLOSED)
  }

  /**
   * Sends a message through the WebSocket connection.
   *
   * @param data - The message to send (typically JSON stringified data)
   * @returns `true` if the message was sent successfully, `false` if connection is not open
   */
  send(data: string): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
      return true
    }
    return false
  }

  /**
   * Gets the current connection status.
   *
   * @returns The current WebSocket status (CONNECTING, OPEN, CLOSING, or CLOSED)
   */
  getStatus(): WebSocketStatus {
    if (!this.ws) return WebSocketStatus.CLOSED

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return WebSocketStatus.CONNECTING
      case WebSocket.OPEN:
        return WebSocketStatus.OPEN
      case WebSocket.CLOSING:
        return WebSocketStatus.CLOSING
      case WebSocket.CLOSED:
        return WebSocketStatus.CLOSED
      default:
        throw new Error('Unknown WebSocket state')
    }
  }

  private attachEventListeners(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.options.onStatusChange?.(WebSocketStatus.OPEN)

      if (this.options.initialHandshake) {
        this.ws?.send(this.options.initialHandshake)
      }
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        this.options.onMessage?.(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.handleError()
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)

      if (!this.isManualClose && this.shouldReconnect()) {
        this.scheduleReconnect()
      } else {
        this.options.onStatusChange?.(WebSocketStatus.CLOSED)
      }
    }
  }

  private handleError(): void {
    this.options.onStatusChange?.(WebSocketStatus.CLOSED)

    if (this.shouldReconnect()) {
      this.scheduleReconnect()
    }
  }

  private shouldReconnect(): boolean {
    return this.reconnectAttempts < (this.options.maxReconnectAttempts || 5)
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    this.options.onStatusChange?.(WebSocketStatus.CONNECTING)

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, this.options.reconnectDelay)
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }
}
