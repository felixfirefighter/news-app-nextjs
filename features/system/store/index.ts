import { newsApi } from '@/features/news/store/api/news-api'
import newsReducer from '@/features/news/store/states/news-state'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

// Root reducer combining all slices
const rootReducer = combineReducers({
  news: newsReducer,
  [newsApi.reducerPath]: newsApi.reducer
})

export type RootState = ReturnType<typeof rootReducer>

// Store factory function so we can create stores with consistent configuration
export const createStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(newsApi.middleware)
  })

  setupListeners(store.dispatch)

  return store
}

// Export a pre-configured store instance for easy usage
export const store = createStore()

// Inferred types
export type AppStore = ReturnType<typeof createStore>
export type AppDispatch = AppStore['dispatch']
