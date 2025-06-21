import { RootState } from '@/features/system/store'
import { createSelector } from '@reduxjs/toolkit'

const selectAllNews = (state: RootState) => state.news.allNews
const selectSelectedAssets = (state: RootState) => state.news.selectedAssets
const selectSelectedSources = (state: RootState) => state.news.selectedSources
const selectSelectedKeywords = (state: RootState) => state.news.selectedKeywords

// Selectors to get filter options from all news items
export const selectFilterOptions = createSelector(
  [selectAllNews],
  (allNews) => {
    const assetsSet = new Set<string>()
    const sourcesSet = new Set<string>()
    const keywordsSet = new Set<string>()

    allNews.forEach((item) => {
      item.assets.forEach((asset) => assetsSet.add(asset))
      sourcesSet.add(item.source)
      item.keywords.forEach((keyword) => keywordsSet.add(keyword))
    })

    return {
      assets: Array.from(assetsSet).sort((a, b) => a.localeCompare(b)),
      sources: Array.from(sourcesSet).sort((a, b) => a.localeCompare(b)),
      keywords: Array.from(keywordsSet).sort((a, b) => a.localeCompare(b))
    }
  }
)

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
