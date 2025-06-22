import { getStatusConfig } from '@/features/news/utils/status'
import { WebSocketStatus } from '@/features/system/types/websocket'

interface Props {
  status: WebSocketStatus
}

export const NewsConnectionStatus: React.FC<Props> = (props) => {
  const { status } = props
  const config = getStatusConfig(status)
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full ${config.color} ${
            config.pulse ? 'animate-pulse' : ''
          }`}
        />
        {config.pulse && (
          <div
            className={`absolute inset-0 w-2 h-2 rounded-full ${config.color} animate-ping opacity-75`}
          />
        )}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {config.text}
      </span>
    </div>
  )
}
