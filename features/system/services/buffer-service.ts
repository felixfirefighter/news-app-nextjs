import { BufferServiceOptions } from '@/features/system/types/buffer'

/**
 * A high-performance buffer service that batches and processes items efficiently.
 *
 * This service collects items in a buffer and processes them in batches to optimize performance
 * while preventing UI blocking. Supports two modes: immediate processing (using requestAnimationFrame)
 * and periodic processing (using setTimeout intervals).
 *
 * @template T - The type of items to be buffered and processed
 *
 * @example
 * ```typescript
 * // Immediate mode (default) - processes on next animation frame
 * const logBuffer = new BufferService<string>(
 *   (messages) => console.log('Processing:', messages),
 *   {
 *     maxBatchSize: 50,
 *     maxProcessingTimeInMs: 16,
 *     mode: 'immediate'
 *   }
 * );
 *
 * // Add items - they'll be batched automatically
 * logBuffer.addItem('Log message 1');
 * logBuffer.addItem('Log message 2');
 * ```
 *
 * @example
 * ```typescript
 * // Periodic mode - processes every specified interval
 * const apiBuffer = new BufferService<ApiCall>(
 *   (calls) => sendBatchRequest(calls),
 *   {
 *     maxBatchSize: 100,
 *     flushIntervalInMs: 2000,
 *     maxProcessingTimeInMs: 10,
 *     mode: 'periodic'
 *   }
 * );
 * ```
 */
export class BufferService<T> {
  private messageBuffer: T[] = []
  private processingQueue: T[] = []
  private rafId: number | null = null
  private timeoutId: number | null = null
  private isProcessing = false

  private readonly maxBatchSize: number
  private readonly maxProcessingTimeInMs: number
  private readonly flushIntervalInMs: number
  private readonly mode: 'immediate' | 'periodic'
  private readonly onFlush: (items: T[]) => void

  /**
   * Creates a new BufferService instance.
   *
   * @param onFlush - Callback function to process batched items
   * @param options - Configuration options
   * @param options.maxBatchSize - Maximum items processed per batch (default: 100)
   * @param options.maxProcessingTimeInMs - Maximum time spent processing per chunk in milliseconds (default: 8)
   * @param options.flushIntervalInMs - Flush interval for periodic mode in milliseconds (default: 1000)
   * @param options.mode - Processing mode: 'immediate' uses RAF, 'periodic' uses intervals (default: 'immediate')
   */
  constructor(options: BufferServiceOptions<T>) {
    const {
      maxBatchSize = 100,
      maxProcessingTimeInMs = 8,
      flushIntervalInMs = 1000,
      mode = 'immediate',
      onFlush
    } = options

    this.maxBatchSize = maxBatchSize
    this.maxProcessingTimeInMs = maxProcessingTimeInMs
    this.flushIntervalInMs = flushIntervalInMs
    this.mode = mode
    this.onFlush = onFlush
  }

  /**
   * Adds an item to the buffer for processing.
   *
   * Items are automatically scheduled for batch processing based on the configured
   * mode (immediate via requestAnimationFrame or periodic via setTimeout).
   *
   * @param data - The item to add to the buffer
   */
  addItem(data: T): void {
    console.log('BufferService: Adding item to buffer:', data)
    this.messageBuffer.push(data)
    this.scheduleFlush()
  }

  private scheduleFlush(): void {
    // Avoid scheduling multiple flushes
    if (this.rafId !== null || this.isProcessing) {
      return
    }

    switch (this.mode) {
      case 'periodic':
        // Use setTimeout for periodic flushing
        if (this.timeoutId === null) {
          this.timeoutId = window.setTimeout(() => {
            this.timeoutId = null
            this.startProcessing()
          }, this.flushIntervalInMs)
        }
        break
      case 'immediate':
      default:
        // Use requestAnimationFrame for immediate processing
        if (this.rafId === null) {
          this.rafId = requestAnimationFrame(() => {
            this.rafId = null
            this.startProcessing()
          })
        }
    }
  }

  /**
   * Triggers immediate processing of buffered items.
   *
   * Cancels any scheduled flush and starts processing the current buffer.
   * Processing still respects batch size and time constraints to prevent blocking.
   */
  flush(): void {
    this.cancelScheduledFlush()
    this.startProcessing()
  }

  /**
   * Forces immediate processing of all buffered items, ignoring batch size and time constraints.
   *
   * Cancels any scheduled flush and processes all items in the buffer immediately.
   * This is useful for scenarios where you need to ensure all items are processed right away.
   */
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

  /**
   * Cleans up resources and processes any remaining buffered items.
   *
   * Cancels scheduled operations and forces a final flush of all pending items.
   * Call this method when the buffer service is no longer needed.
   */
  destroy(): void {
    this.cancelScheduledFlush()
    this.forceFlush()
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
      performance.now() - startTime < this.maxProcessingTimeInMs
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
