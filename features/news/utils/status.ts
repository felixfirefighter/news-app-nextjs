import { WebSocketStatus } from '@/features/system/types/websocket'

export const getStatusConfig = (status: WebSocketStatus) => {
  switch (status) {
    case WebSocketStatus.OPEN:
      return {
        color: 'bg-green-500',
        text: 'Connected',
        pulse: false
      }
    case WebSocketStatus.CONNECTING:
      return {
        color: 'bg-yellow-500',
        text: 'Connecting...',
        pulse: true
      }
    case WebSocketStatus.CLOSED:
      return {
        color: 'bg-red-500',
        text: 'Disconnected',
        pulse: false
      }
    default:
      return {
        color: 'bg-gray-500',
        text: status || 'Unknown',
        pulse: false
      }
  }
}
