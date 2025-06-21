import { newsReceived } from '@/features/news/services/states/news-slice'
import { NewsItem } from '@/features/news/types/news-item'
import { applicationConfig } from '@/features/system/application/config'
import { BufferService } from '@/features/system/services/buffer-service'
import { WebSocketService } from '@/features/system/services/websocket-service'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const newsApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: ''
  }),
  endpoints: (build) => ({
    getNews: build.query<NewsItem[], string>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        arg,
        { dispatch, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const bufferService = new BufferService<NewsItem>((items) => {
          dispatch(newsReceived(items))
        })
        const wsService = new WebSocketService({
          url: arg,
          initialHandshake: applicationConfig.newsWebSocketHandshake,
          onMessage: (data: NewsItem) => {
            bufferService.addItem({
              ...data,
              assets: Array.from(new Set(data.assets)),
              keywords: Array.from(new Set(data.keywords))
            })
          },
          onStatusChange: (status, error) => {
            if (status === 'connected') {
              console.log('WebSocket connected')
            } else if (status === 'error') {
              console.error('WebSocket error:', error)
            }
          }
        })
        try {
          await cacheDataLoaded
          wsService.connect()
          await cacheEntryRemoved
        } catch (error) {
          console.error('Error in news WebSocket connection:', error)
        } finally {
          bufferService.destroy()
          wsService.disconnect()
        }
      }
    })
  })
})

export const { useGetNewsQuery } = newsApi
