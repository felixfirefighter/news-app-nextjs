import { newsAdapter } from '@/features/news/store/adapters/news-adapter'
import { NewsItem } from '@/features/news/types/news-item'
import { NewsState } from '@/features/news/types/news-state'
import { applicationConfig } from '@/features/system/config'
import { WebSocketStatus } from '@/features/system/types/websocket'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: NewsState = {
  assets: [],
  sources: [],
  keywords: [],

  selectedAssets: [],
  selectedSources: [],
  selectedKeywords: [],
  connectionStatus: WebSocketStatus.CLOSED
}

const newsSlice = createSlice({
  name: 'news',
  initialState: newsAdapter.getInitialState(initialState),
  reducers: {
    newsReceived: (state, action: PayloadAction<NewsItem[]>) => {
      const assetsSet = new Set(state.assets)
      const sourcesSet = new Set(state.sources)
      const keywordsSet = new Set(state.keywords)

      const processedItems: NewsItem[] = action.payload.map((item) => {
        // Update filter options
        item.assets.forEach((asset) => assetsSet.add(asset))
        sourcesSet.add(item.source)
        item.keywords.forEach((keyword) => keywordsSet.add(keyword))

        return {
          ...item,
          assets: Array.from(new Set(item.assets)),
          keywords: Array.from(new Set(item.keywords))
        }
      })

      newsAdapter.addMany(state, processedItems)

      state.assets = Array.from(assetsSet).sort()
      state.sources = Array.from(sourcesSet).sort()
      state.keywords = Array.from(keywordsSet).sort()

      // Remove older news
      const allIds = newsAdapter.getSelectors().selectIds(state)
      if (allIds.length > applicationConfig.maxNewsItem) {
        const idsToRemove = allIds.slice(applicationConfig.maxNewsItem)
        newsAdapter.removeMany(state, idsToRemove)
      }
    },
    setConnectionStatus: (state, action: PayloadAction<WebSocketStatus>) => {
      state.connectionStatus = action.payload
    },
    setSelectedAssets: (state, action: PayloadAction<string[]>) => {
      state.selectedAssets = action.payload
    },
    setSelectedSources: (state, action: PayloadAction<string[]>) => {
      state.selectedSources = action.payload
    },
    setSelectedKeywords: (state, action: PayloadAction<string[]>) => {
      state.selectedKeywords = action.payload
    }
  }
})

export const {
  newsReceived,
  setConnectionStatus,
  setSelectedAssets,
  setSelectedKeywords,
  setSelectedSources
} = newsSlice.actions

export default newsSlice.reducer
