'use client'

import { NewsFilters } from '@/features/news/components/news-filters'
import { NewsList } from '@/features/news/components/news-list'
import { useGetNewsQuery } from '@/features/news/services/api/news-api'
import { applicationConfig } from '@/features/system/application/config'

export const NewsFeed = () => {
  useGetNewsQuery(applicationConfig.newsWebSocketUrl)

  return (
    <div className="container mx-auto p-4 space-y-6 h-svh flex flex-col">
      <h1 className="text-3xl font-bold">News Feed</h1>
      <NewsFilters />
      <NewsList />
    </div>
  )
}
