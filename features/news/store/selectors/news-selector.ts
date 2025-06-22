import { selectAllNews } from '@/features/news/store/adapters/news-adapter'
import { RootState } from '@/features/system/store'
import { createSelector } from '@reduxjs/toolkit'

const selectSelectedAssets = (state: RootState) => state.news.selectedAssets
const selectSelectedSources = (state: RootState) => state.news.selectedSources
const selectSelectedKeywords = (state: RootState) => state.news.selectedKeywords

// Selector to filter news items based on selected assets, sources, and keywords
export const selectFilteredNews = createSelector(
  [
    selectAllNews,
    selectSelectedAssets,
    selectSelectedSources,
    selectSelectedKeywords
  ],
  (allNews, selectedAssets, selectedSources, selectedKeywords) => {
    if (
      selectedAssets.length === 0 &&
      selectedSources.length === 0 &&
      selectedKeywords.length === 0
    ) {
      return allNews
    }

    const selectedAssetsSet = new Set(selectedAssets)
    const selectedSourcesSet = new Set(selectedSources)
    const selectedKeywordsSet = new Set(selectedKeywords)

    // Assuming number of source is the least, we check that first for performance
    // We check keywords last as they can be many keywords
    return allNews.filter((item) => {
      if (selectedSourcesSet.size > 0 && !selectedSourcesSet.has(item.source)) {
        return false
      }

      if (
        selectedAssetsSet.size > 0 &&
        !item.assets.some((asset) => selectedAssetsSet.has(asset))
      ) {
        return false
      }

      if (
        selectedKeywordsSet.size > 0 &&
        !item.keywords.some((keyword) => selectedKeywordsSet.has(keyword))
      ) {
        return false
      }

      return true
    })
  }
)
