'use client'

import { NewsFilterControls } from '@/features/news/components/news-filter-controls'
import { NewsList } from '@/features/news/components/news-list'
import { selectAllNews } from '@/features/news/store/adapters/news-adapter'
import { useGetNewsQuery } from '@/features/news/store/api/news-api'
import { selectFilteredNews } from '@/features/news/store/selectors/news-selector'
import {
  setSelectedAssets,
  setSelectedKeywords,
  setSelectedSources
} from '@/features/news/store/states/news-state'
import { applicationConfig } from '@/features/system/config'
import { useAppDispatch, useAppSelector } from '@/features/system/store/hooks'

export const NewsContainer = () => {
  const { newsWebSocketUrl, maxNewsItem } = applicationConfig

  // Connect to websocket
  useGetNewsQuery(newsWebSocketUrl)

  const filteredNews = useAppSelector(selectFilteredNews)
  const allNews = useAppSelector(selectAllNews)
  const connectionStatus = useAppSelector(
    (state) => state.news.connectionStatus
  )

  const assets = useAppSelector((state) => state.news.assets)
  const sources = useAppSelector((state) => state.news.sources)
  const keywords = useAppSelector((state) => state.news.keywords)

  const dispatch = useAppDispatch()
  const onSelectedAssetsChanged = (values: string[]) =>
    dispatch(setSelectedAssets(values))
  const onSelectedSourcesChanged = (values: string[]) =>
    dispatch(setSelectedSources(values))
  const onSelectedKeywordsChanged = (values: string[]) =>
    dispatch(setSelectedKeywords(values))

  return (
    <div className="container mx-auto p-4 space-y-3 h-svh flex flex-col">
      <h1 className="text-3xl font-bold">News Feed</h1>
      <NewsFilterControls
        sources={sources}
        assets={assets}
        keywords={keywords}
        onSelectedAssetsChanged={onSelectedAssetsChanged}
        onSelectedKeywordsChanged={onSelectedKeywordsChanged}
        onSelectedSourcesChanged={onSelectedSourcesChanged}
      />
      <NewsList
        filteredNews={filteredNews}
        allNews={allNews}
        connectionStatus={connectionStatus}
        maxNewsItem={maxNewsItem}
      />
    </div>
  )
}
