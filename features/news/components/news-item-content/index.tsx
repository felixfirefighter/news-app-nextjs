import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NewsItem } from '@/features/news/types/news-item'
import { formatHostname, getInitials } from '@/features/news/utils/format'
import clsx from 'clsx'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface Props {
  newsItem: NewsItem
}

export const NewsItemContent: React.FC<Props> = ({ newsItem }) => {
  const { headline, timestamp, priority, source, link, keywords, assets } =
    newsItem

  return (
    <div
      className={clsx('flex items-center space-x-4 p-4', {
        'hover:bg-gray-50': priority !== 'high',
        'bg-amber-300 hover:bg-amber-400': priority === 'high'
      })}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center">
        {getInitials(source)}
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <Link
            href={link || '#'}
            target={link && '_blank'}
            className="md:mb-2 md:flex md:items-center"
          >
            <p className="mb-2 font-medium text-sm md:mb-0">{headline}</p>
            <p className="mb-2 text-xs md:mb-0 mx-2 gap-1 flex items-center">
              <Badge variant={'secondary'}>{source}</Badge>
              {link && `(${formatHostname(link)})`}{' '}
            </p>
          </Link>
          <div className="text-xs flex items-center gap-1">
            <CalendarIcon size={12} />
            {format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss')}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-2 text-xs md:flex md:gap-4 justify-between">
          <div className="flex items-center gap-1">
            {assets.map((asset) => (
              <Badge key={asset} className="text-xs px-2 py-0.5 font-medium">
                {asset}
              </Badge>
            ))}

            {keywords.map((keyword) => (
              <Badge
                key={keyword}
                variant="outline"
                className="text-xs px-2 py-0.5 text-gray-600"
              >
                {keyword}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={'outline'}
              size={'sm'}
              onClick={() => {
                console.log(newsItem)
              }}
            >
              Log to Console
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
