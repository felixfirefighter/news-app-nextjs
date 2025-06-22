'use client'

import { NewsFilterControls } from '@/features/news/components/news-filter-controls'
import { NewsList } from '@/features/news/components/news-list'
import { useGetNewsQuery } from '@/features/news/store/api/news-api'
import { applicationConfig } from '@/features/system/config'

export const NewsFeed = () => {
  useGetNewsQuery(applicationConfig.newsWebSocketUrl)

  return (
    <div className="container mx-auto p-4 space-y-6 h-svh flex flex-col">
      <h1 className="text-3xl font-bold">News Feed</h1>
      <NewsFilterControls />
      <NewsList />
    </div>
  )
}
