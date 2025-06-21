export interface NewsItem {
  id: string
  source: string
  headline: string
  assets: string[]
  link?: string
  keywords: string[]
  timestamp: number
  priority?: NewsPriority
}

export type NewsPriority = 'high'
