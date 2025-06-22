import { NewsItem } from '@/features/news/types/news-item'
import { RootState } from '@/features/system/store'
import { createEntityAdapter } from '@reduxjs/toolkit'

export const newsAdapter = createEntityAdapter<NewsItem>({
  sortComparer: (a, b) => b.timestamp - a.timestamp
})

export const { selectAll: selectAllNews } = newsAdapter.getSelectors(
  (state: RootState) => state.news
)
