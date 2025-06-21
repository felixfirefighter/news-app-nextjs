import { MultiSelect } from '@/components/multi-select'
import { selectFilterOptions } from '@/features/news/services/selectors/news-selector'
import {
  setSelectedAssets,
  setSelectedKeywords,
  setSelectedSources
} from '@/features/news/services/states/news-slice'
import { useAppDispatch, useAppSelector } from '@/features/system/store/hooks'

export const NewsFilters = () => {
  const { assets, sources, keywords } = useAppSelector(selectFilterOptions)
  const dispatch = useAppDispatch()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4  border rounded-lg">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sources
        </label>
        <MultiSelect
          options={sources.map((item) => {
            return {
              label: item,
              value: item
            }
          })}
          onValueChange={(values) => dispatch(setSelectedSources(values))}
          defaultValue={[]}
          placeholder="Filter by news sources"
          maxCount={2}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Assets
        </label>
        <MultiSelect
          options={assets.map((item) => {
            return {
              label: item,
              value: item
            }
          })}
          onValueChange={(values) => dispatch(setSelectedAssets(values))}
          defaultValue={[]}
          placeholder="Filter by assets"
          maxCount={3}
          variant={'default'}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Keywords
        </label>
        <MultiSelect
          options={keywords.map((item) => {
            return {
              label: item,
              value: item
            }
          })}
          onValueChange={(values) => dispatch(setSelectedKeywords(values))}
          defaultValue={[]}
          placeholder="Filter by keywords"
          maxCount={3}
        />
      </div>
    </div>
  )
}
