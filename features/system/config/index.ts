import { ApplicationConfig } from '@/features/system/types/aplication-config'

export const applicationConfig: ApplicationConfig = {
  maxNewsItem: 100_000, // Maximum number of news items to keep in memory - stress test value
  newsWebSocketUrl:
    process.env.NEXT_PUBLIC_NEWS_WEBSOCKET_URL || 'ws://localhost:8080',
  newsWebSocketHandshake: 'hello'
}
