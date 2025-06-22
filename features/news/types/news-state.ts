import { WebSocketStatus } from '@/features/system/types/websocket'

export interface NewsState {
  assets: string[]
  sources: string[]
  keywords: string[]

  selectedAssets: string[]
  selectedSources: string[]
  selectedKeywords: string[]
  connectionStatus: WebSocketStatus
}
