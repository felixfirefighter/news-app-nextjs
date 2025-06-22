# News Feed NextJS

## Problem & Solution

Financial traders need real-time access to market news to make informed decisions. Traditional news feeds often struggle with performance issues when handling high-frequency data streams, leading to UI lag and poor user experience.

This project solves these challenges by building a high-performance, real-time news feed application specifically designed for traders. It leverages modern web technologies to handle large volumes of incoming news data without compromising UI responsiveness, while providing essential filtering and prioritization features that traders need.

## Preview

![Screenshot 2025-06-23 at 12 15 34 AM](https://github.com/user-attachments/assets/5773b63a-8c62-4788-848d-57bf962ab226)

## Getting Started

This NextJS project is bootstrapped with ShadCN. Learn more about the setup [here](https://ui.shadcn.com/docs/installation/next).

```bash
pnpm dlx shadcn@latest init
```

## Developer Setup

### Prerequisite

Ensure you have the following installed:

**Required:**

- [NodeJS](https://nodejs.org/en/download) (minimum v18)
- [PNPM](https://pnpm.io/installation) - Fast package manager
- [git-cz](https://github.com/streamich/git-cz) - Structured commit messages

**VSCode Extensions:**

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Code linting
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Code formatting
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - CSS utilities

**Optional but Recommended:**

- [Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) - Enhanced comment styling
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) - Git visualization

##### Good to have

[Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments) - Provide styling for comments
[GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) - Visualize Git history directly in your IDE

### Development Workflow

1. **Environment Setup**

   ```bash
   # Copy template and configure environment
   cp .env.template .env
   # Edit .env with your configuration
   ```

2. **Run Development Server**

   ```bash
   pnpm install # download dependencies
   pnpm dev  # Starts on localhost:3000
   ```

3. **Build for Production**

   ```bash
   pnpm build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git cz  # Use structured commit messages
   ```

## Tech Stack

**Core Technologies:**

- **[NextJS](https://nextjs.org/)** - React framework with built-in optimizations
- **[ShadCN](https://ui.shadcn.com/)** - Customizable UI component library
- **[Redux Toolkit (RTK)](https://redux-toolkit.js.org/)** - State management with API layer
- **[React Virtuoso](https://virtuoso.dev/)** - Virtualized rendering for performance

## Architecture

![image](https://github.com/user-attachments/assets/2267e2e3-0747-49c7-9bbe-e5c77cbe49c6)

### Design Philosophy

This project uses **opinionated frameworks** to ensure consistency and maintainability:

- NextJS provides filesystem-based routing and development conventions
- RTK offers standardized state management patterns
- ShadCN delivers customizable, high-quality components
- Tailwind CSS eliminates the need for custom stylesheets

**Trade-offs:**

- **Pros:** Consistent patterns, faster onboarding, battle-tested solutions
- **Cons:** Reduced flexibility, steeper learning curve, framework lock-in

### Project Structure

It will be helpful to familiarize yourself with NextJS project structure [here](https://nextjs.org/docs/app/getting-started/project-structure). It mostly has to do with `app` and `public` folders in our current repo.

```
app/                        # NextJS app routes
├── layout.tsx              # Application layout
├── page.tsx                # Main page component
└── globals.css             # Global styles, ShadCN styling is here as well

components/                 # ShadCN UI components
└── ui/                     # UI components
    └── multi-select.tsx    # Multi-select component (https://github.com/sersavan/shadcn-multi-select-component)

features/
├── _template/              # Feature template and scaffolding
│   ├── components/         # Dumb UI components
│   ├── config/             # Configuration files
│   ├── containers/         # Container - Layer between states / business logic and dumb UI components
│   ├── services/           # Services - Business logic
│   ├── store/              # Redux state management
|   |   ├── adapters        # Redux adapters - Normalize data for performance and management
|   |   ├── api/            # RTK Query - making API call
|   |   ├── selectors/      # Selectors for accessing states
|   |   └── states/         # Redux states/slice
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── news/                   # News feature module
└── system/                 # System-level module

lib                         # Lib for ShadCN UI
```

As shown above, `features` folder is the main place we will be writing most of our code. This repo structure is also known as feature-based structure.

The following is the architecture of how we structure the flow of code.

```
UI Components → Containers → RTK Store → Services + External APIs
```

#### Why feature-based structure instead of type-based structure?

**TLDR: Colocation + Scalability**

If we zoom in and look at `_template` folder, it looks just like a tiny repo with everything it needs (UI, business logic, types and so on). We can look at each feature folder as an independent project / product, and it can grow large in its own space. Whatever the feature needs, they are all located closely to it, while isolating itself from other features, so there is a separation of concern.

`system` is a unique module. You can look at it as `global`, `application`, `master` module as it is responsibility for application level features. Common utils, services, components should go into this module as well.

#### RTK + RTK Query = State Management + API call = Proxy between UI and API / data

RTK served as state management for our application is intuitive, it also provides a layer between the UI and business logic / API layer.

Whatever API call that we want to make would go through RTK Query, helping us managing the state / result from API.

Imagine we are looking from the POV of the view layer, all we see is RTK. We have no knowledge of how the states / result are from, which is good, as it is not the responsibility of the UI to know how the logic is being handled.

Since RTK Query provides the capability to handle asynchronous flow, we have `api` under the `store`.

`selectors` are basically computed data. `selectors` are efficient, they are not recomputed unless one of its arguments changes.

For example, there's a news list in states, but you want a filtered news list. You can use a `selector` and apply the filter and return filtered news list instead of storing the filtered news in the state.

`adapaters` are for advanced use case when we want to manage large data set and improve the performance. The most important here is `createEntityAdapter`

Imagine when we receive a list of items, instead of just storing them as array. `createEntityAdapter` creates this

```
{
  ids: ['1', '2,', '3'],
  entities: {
    '1': {},
    '2': {},
    '3': {}
  }
}
```

The function helps us to normalize the data, and it provides faster lookup as well O(1)

#### Why do we need service layer?

The service layer is responsible for business logic. We can look at `BufferService` and `WebsocketService` to illustrate the point.

We could have dumped all the buffering, connecting to websocket logic in API layer itself, but the API layer will become super complicated. Also it is not really the responsibility of API layer. Also, we could potentially have other feature that wants to have websocket capability. In that case, we can just reuse `WebsocketService`. `BufferService` is created because it helps to handle buffering data to our states so that UI does not tank. What `BufferService` does is not the responsibility of `WebsocketService`.

As you can see from the theme of the architecture, we want to have each component / service to have their own responsibility, and we piece them together to get the outcome that we want, it's like playing LEGO!

#### Containers = Layer between UI and State

The frontend repo always has this risk of having too many complex logics on the view layer. A container acts as the layer between UI and state, so that UI layer can do what they do best, presenting the UI.

A container is like a manager that talks to external parties (i.e. state), prepare the functions necessary and pass to the components.

## Potential Enhancements

### Use antd, MUI, or other UI library

ShadCN does not have a lot of components. Having the ownership of UI components sound good on paper, but it's extra code for us to maintain. A battle-tested UI library can give us the velocity needed to deliver our product. ShadCN also "pollutes" our repo by placing the code at root.

### Reconnect button for Websocket

Currently there is no way to reconnect in case of Websocket connection failure. Provide user a way out is helpful

### Testing

We can use [jest](https://jestjs.io/) for unit test and [playwright](https://playwright.dev/) for E2E testing.

### Better buffer management

Currently we do not throw away any news as we deem all the news are important to the users. If the websocket pushes a lot of news in short amount of time, the items in the buffer will start to pile up, and it will take a lot of time for `BufferService` to push those to the state.

## AI

AI tools were used for:

- Code review and optimization suggestions
- Documentation improvement
- Architecture pattern validation
- Component design iteration

_Note: AI-generated code snippets in this README may not exactly match the current implementation due to post-generation modifications._

### Claude Sonnet 4

```
I am writing the README, help me write a section using Markdown, something like:

features
| feature-name
| -- components

Not necessary the structure I provide above, I don't know how people do that online and please let me know if you need more clarification.
```

```
Is there a way to add a placeholder or empty view to Virtuoso so the list is not completely empty initially?
```

```
Help me add connection indicator in this view

import { NewsItemContent } from '@/features/news/components/news-item-content'
import { selectFilteredNews } from '@/features/news/store/selectors/news-selector'
import { applicationConfig } from '@/features/system/config'
import { useAppSelector } from '@/features/system/store/hooks'
import { Virtuoso } from 'react-virtuoso'

export const NewsList: React.FC = () => {
  const filteredNews = useAppSelector(selectFilteredNews)
  const allNews = useAppSelector((state) => state.news.allNews)
  const connectionStatus = useAppSelector(
    (state) => state.news.connectionStatus
  )

  return (
    <>
      <div className="flex border justify-between items-center mb-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {/* TODO: Connection Indicator */}
          {connectionStatus}
        </p>
      </div>
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
```

```
import { BufferServiceProps } from '@/features/system/types/buffer'

export class BufferService<T> {
  private messageBuffer: T[] = []
  private processingQueue: T[] = []
  private rafId: number | null = null
  private timeoutId: number | null = null
  private isProcessing = false
  private onFlush: (items: T[]) => void

  private readonly maxBatchSize: number
  private readonly maxProcessingTimeInMs: number
  private readonly flushIntervalInMs?: number

  constructor(onFlush: (items: T[]) => void, options: BufferServiceProps = {}) {
    this.onFlush = onFlush
    this.maxBatchSize = options.maxBatchSize ?? 100
    this.maxProcessingTimeInMs = options.maxProcessingTimeInMs ?? 8
    this.flushIntervalInMs = options.flushIntervalInMs
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

    if (this.flushIntervalInMs) {
      // Use setTimeout for periodic flushing
      if (this.timeoutId === null) {
        this.timeoutId = window.setTimeout(() => {
          this.timeoutId = null
          this.startProcessing()
        }, this.flushIntervalInMs)
      }
    } else {
      // Use requestAnimationFrame for immediate processing
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null
        this.startProcessing()
      })
    }
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

Help me write comment header for this class so developer gets clue on their IDE when they hover on the class
```

```
export class BufferService<T> {
  private messageBuffer: T[] = []
  private rafId: number | null = null
  private onFlush: (items: T[]) => void

  constructor(onFlush: (items: T[]) => void) {
    this.onFlush = onFlush
  }

  addItem(data: T): void {
    this.messageBuffer.push(data)
    this.scheduleFlush()
  }

  flush(): void {
    if (this.messageBuffer.length === 0) {
      this.rafId = null
      return
    }

    const itemsToFlush = [...this.messageBuffer]
    this.messageBuffer = []
    this.onFlush(itemsToFlush)
    this.rafId = null
  }

  forceFlush(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.flush()
  }

  destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
    this.forceFlush()
  }

  private scheduleFlush(): void {
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => this.flush())
    }
  }
}

I have this buffer service that I use with websocket. The websocket could return large amount of data in short time period. Will the UI hang? If so, how do we improve the BufferService?
```

```
export interface NewsItem {
  id: string
  source: string
  headline: string
  assets: string[]
  link?: string | null
  keywords: string[]
  timestamp: number
  priority?: NewsPriority
}

import { useGetNewsQuery } from '@/features/news/services/api/news-api'
import { Virtuoso } from 'react-virtuoso'

export const NewsItems: React.FC = (props) => {
  const { data } = useGetNewsQuery()

  console.log('NewsItems data:', data)

  if (!data || data.length === 0) {
    return null
  }

  return (
    <>
      <Virtuoso
        data={data}
        itemContent={(_, newsItem) => (
          //   TODO: render news item component
          <div></div>
        )}
      />
    </>
  )
}

Taking the image as inspiration, create the itemContent for me using ShadCN. Please keep in mind it's a news source for trader which a lot of news keep coming from websocket every second. Be conscious with the vertical space use.
```

```
I am creating a component using ShadCN. Help me create it using the following spec. You may use dummy JSON array for the data. 1. Display news items in a list format, with each item showing: - Timestamp, in either local time or UTC - Headline - Source - Link, if provided - Associated keywords and assets, if provided - Some way of distinguishing high priority items - A button labelled "Log to Console" to log the news item object to the console 2. Real-time updates: - New items should appear immediately when received - Items should be sorted by timestamp (newest first) - (Optional) Animation to catch the users' attention when new items appear 3. Filtering: - Allow filtering by news source - Allow filtering by keywords and assets - Filters should be applied "instantly" 4. Basic styling: - Clean, readable layout - (Optional) Responsive design that works on mobile and desktop
```

```
Help me optimize the README without changing its meaning. Also help me write an introduction that fulfills this requirement

"Description of the problem and solution."
```
