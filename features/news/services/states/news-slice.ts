import { NewsItem } from '@/features/news/types/news-item'
import { applicationConfig } from '@/features/system/application/config'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface NewsState {
  selectedAssets: string[]
  selectedSources: string[]
  selectedKeywords: string[]
  allNews: NewsItem[]
}

const initialState: NewsState = {
  selectedAssets: [],
  selectedSources: [],
  selectedKeywords: [],
  allNews: []
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    newsReceived: (state, action: PayloadAction<NewsItem[]>) => {
      state.allNews.unshift(...action.payload)
      if (state.allNews.length > applicationConfig.maxNewsItem) {
        state.allNews.splice(applicationConfig.maxNewsItem)
      }
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
  setSelectedAssets,
  setSelectedKeywords,
  setSelectedSources
} = newsSlice.actions
export default newsSlice.reducer
