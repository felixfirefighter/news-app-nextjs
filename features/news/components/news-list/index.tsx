import { NewsItemContent } from '@/features/news/components/news-item-content'
import { selectFilteredNews } from '@/features/news/services/selectors/news-selector'
import { applicationConfig } from '@/features/system/application/config'
import { useAppSelector } from '@/features/system/store/hooks'
import { Virtuoso } from 'react-virtuoso'

export const NewsList: React.FC = (props) => {
  const filteredNews = useAppSelector(selectFilteredNews)
  const allNews = useAppSelector((state) => state.news.allNews)

  return (
    <>
      <div className="flex-1">
        <Virtuoso
          className="border rounded"
          data={filteredNews}
          itemContent={(_, newsItem) => <NewsItemContent newsItem={newsItem} />}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-0">
        <p className="italic text-sm">
          Only the latest{' '}
          {applicationConfig.maxNewsItem.toLocaleString('en-US')} news will be
          displayed.
        </p>
        <p>
          Showing {filteredNews.length} of {allNews.length} news
        </p>
      </div>
    </>
  )
}
