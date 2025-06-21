export interface BufferServiceOptions {
  maxBatchSize?: number
  maxProcessingTime?: number
  flushInterval?: number
}

export class BufferService<T> {
  private messageBuffer: T[] = []
  private processingQueue: T[] = []
  private rafId: number | null = null
  private timeoutId: number | null = null
  private onFlush: (items: T[]) => void
  private isProcessing = false

  private readonly maxBatchSize: number
  private readonly maxProcessingTime: number

  constructor(
    onFlush: (items: T[]) => void,
    options: BufferServiceOptions = {}
  ) {
    this.onFlush = onFlush
    this.maxBatchSize = options.maxBatchSize ?? 100
    this.maxProcessingTime = options.maxProcessingTime ?? 8
  }

  addItem(data: T): void {
    this.messageBuffer.push(data)
    this.scheduleFlush()
  }

  private scheduleFlush(): void {
    // Avoid scheduling multiple flushes
    if (this.rafId !== null || this.isProcessing) {
      return
    }

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null
      this.startProcessing()
    })
  }

  private startProcessing(): void {
    if (this.isProcessing || this.messageBuffer.length === 0) {
      return
    }

    this.processingQueue = [...this.messageBuffer]
    this.messageBuffer = []
    this.isProcessing = true

    this.processChunk()
  }

  private processChunk(): void {
    if (this.processingQueue.length === 0) {
      this.isProcessing = false
      return
    }

    const startTime = performance.now()
    const itemsToProcess: T[] = []
    let processedCount = 0

    // Process items within time and batch size constraints
    while (
      this.processingQueue.length > 0 &&
      processedCount < this.maxBatchSize &&
      performance.now() - startTime < this.maxProcessingTime
    ) {
      const item = this.processingQueue.shift()
      if (item !== undefined) {
        itemsToProcess.push(item)
        processedCount++
      }
    }

    // Flush the current chunk
    if (itemsToProcess.length > 0) {
      try {
        this.onFlush(itemsToProcess)
      } catch (error) {
        console.error('Error in onFlush callback:', error)
      }
    }

    // Schedule next chunk if there are more items
    if (this.processingQueue.length > 0) {
      // Use setTimeout(0) to yield control back to browser
      setTimeout(() => this.processChunk(), 0)
    } else {
      this.isProcessing = false

      // Check if new items arrived while processing
      if (this.messageBuffer.length > 0) {
        this.scheduleFlush()
      }
    }
  }

  flush(): void {
    this.cancelScheduledFlush()
    this.startProcessing()
  }

  forceFlush(): void {
    this.cancelScheduledFlush()

    // Process all remaining items immediately (blocking)
    const allItems = [...this.messageBuffer, ...this.processingQueue]
    this.messageBuffer = []
    this.processingQueue = []
    this.isProcessing = false

    if (allItems.length > 0) {
      this.onFlush(allItems)
    }
  }

  destroy(): void {
    this.cancelScheduledFlush()
    this.forceFlush()
  }

  private cancelScheduledFlush(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }
}
