import {
  newsReceived,
  setConnectionStatus
} from '@/features/news/store/states/news-state'
import { NewsItem } from '@/features/news/types/news-item'
import { applicationConfig } from '@/features/system/config'
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
        url,
        { dispatch, cacheDataLoaded, cacheEntryRemoved }
      ) {
        const bufferService = new BufferService<NewsItem>({
          onFlush: (items) => dispatch(newsReceived(items))
        })
        const wsService = new WebSocketService<NewsItem>(url, {
          initialHandshake: applicationConfig.newsWebSocketHandshake,
          onMessage: (data) => bufferService.addItem(data),
          onStatusChange: (status) => dispatch(setConnectionStatus(status))
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
