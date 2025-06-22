import { getStatusConfig } from '@/features/news/utils/status'
import { WebSocketStatus } from '@/features/system/types/websocket'
import clsx from 'clsx'

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
          className={clsx(`w-2 h-2 rounded-full`, config.color, {
            'animate-pulse': config.pulse
          })}
        />
        {config.pulse && (
          <div
            className={clsx(
              `absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75`,
              config.color
            )}
          />
        )}
      </div>
      <span className="text-sm text-gray-600 ">{config.text}</span>
    </div>
  )
}
