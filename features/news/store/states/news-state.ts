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
  allNews: [],
  connectionStatus: WebSocketStatus.CLOSED
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    newsReceived: (state, action: PayloadAction<NewsItem[]>) => {
      const assetsSet = new Set(state.assets)
      const sourcesSet = new Set(state.sources)
      const keywordsSet = new Set(state.keywords)

      action.payload.forEach((item) => {
        // Update filter options based on the new news items
        item.assets.forEach((asset) => {
          assetsSet.add(asset)
        })
        sourcesSet.add(item.source)
        item.keywords.forEach((keyword) => {
          keywordsSet.add(keyword)
        })

        // Remove duplicated assets or keywords
        state.allNews.unshift({
          ...item,
          assets: Array.from(new Set(item.assets)),
          keywords: Array.from(new Set(item.keywords))
        })
      })

      // Remove older news items if the total exceeds the maximum allowed
      if (state.allNews.length > applicationConfig.maxNewsItem) {
        state.allNews.splice(applicationConfig.maxNewsItem)
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
