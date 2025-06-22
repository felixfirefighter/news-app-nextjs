import { NewsConnectionStatus } from '@/features/news/components/news-connection-status'
import { NewsItemContent } from '@/features/news/components/news-item-content'
import { NewsItem } from '@/features/news/types/news-item'
import { WebSocketStatus } from '@/features/system/types/websocket'
import { Virtuoso } from 'react-virtuoso'

interface Props {
  filteredNews: NewsItem[]
  allNews: NewsItem[]
  connectionStatus: WebSocketStatus
  maxNewsItem: number
}

export const NewsList: React.FC<Props> = (props) => {
  const { filteredNews, allNews, connectionStatus, maxNewsItem } = props
  return (
    <>
      <div className="flex-1 mb-0">
        <Virtuoso
          className="border"
          data={filteredNews}
          itemContent={(_, newsItem) => <NewsItemContent newsItem={newsItem} />}
          components={{
            EmptyPlaceholder: () => {
              if (connectionStatus === WebSocketStatus.CLOSED) {
                return (
                  <div className="flex flex-col items-center h-full justify-center text-gray-500">
                    <div className="text-lg mb-2">No news available</div>
                    <div className="text-sm">Check back later for updates</div>
                  </div>
                )
              }

              return (
                <div className="flex flex-col items-center h-full justify-center text-gray-500">
                  <div className="text-lg mb-2">News incoming...</div>
                  <div className="text-sm">Getting the best for you</div>
                </div>
              )
            }
          }}
        />
      </div>
      <div className="border border-t-0 p-2 flex justify-between text-sm text-neutral-500">
        <NewsConnectionStatus status={connectionStatus} />
        <p>
          Showing {filteredNews.length} of {allNews.length} news
        </p>
      </div>
      <div className="flex justify-between text-sm text-gray-500 mt-0">
        <p className="italic">
          Only the latest {maxNewsItem.toLocaleString('en-US')} news will be
          displayed.
        </p>
      </div>
    </>
  )
}
