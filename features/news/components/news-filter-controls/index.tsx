import { MultiSelect } from '@/components/multi-select'
interface Props {
  assets: string[]
  sources: string[]
  keywords: string[]

  onSelectedAssetsChanged: (values: string[]) => void
  onSelectedSourcesChanged: (values: string[]) => void
  onSelectedKeywordsChanged: (values: string[]) => void
}

export const NewsFilterControls: React.FC<Props> = (props) => {
  const {
    sources,
    assets,
    keywords,
    onSelectedAssetsChanged,
    onSelectedKeywordsChanged,
    onSelectedSourcesChanged
  } = props
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
          onValueChange={onSelectedSourcesChanged}
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
          onValueChange={onSelectedAssetsChanged}
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
          onValueChange={onSelectedKeywordsChanged}
          defaultValue={[]}
          placeholder="Filter by keywords"
          maxCount={3}
        />
      </div>
    </div>
  )
}
