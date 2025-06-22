export interface BufferServiceOptions<T> {
  maxBatchSize?: number
  maxProcessingTimeInMs?: number
  flushIntervalInMs?: number
  mode?: 'immediate' | 'periodic'

  onFlush: (items: T[]) => void
}
