import { selectAllNews } from '@/features/news/store/states/news-state'
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

    return allNews.filter((item) => {
      const hasAsset =
        selectedAssetsSet.size === 0 ||
        item.assets.some((asset) => selectedAssetsSet.has(asset))

      const hasSource =
        selectedSourcesSet.size === 0 || selectedSourcesSet.has(item.source)

      const hasKeyword =
        selectedKeywordsSet.size === 0 ||
        item.keywords.some((keyword) => selectedKeywordsSet.has(keyword))

      return hasAsset && hasSource && hasKeyword
    })
  }
)
