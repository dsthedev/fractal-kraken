# How to use AdminScaffold Searching

The Admin Scaffold includes a useSearch parameter that can be used to filter a list of objects shown on a listing component. The action happens in the Cell, to filter the list before being passed to the display component.

## Modify the Cell

The first step is to import the searchQuery context, and dictate what the filter should work on.

```jsx
import { useSearch } from 'src/contexts/SearchContext'

...

export const Success = ({
  rates,
}: CellSuccessProps<FindRates, FindRatesVariables>) => {
  const { searchQuery } = useSearch()

  const filtered = rates.filter((r) => {
    const searchable = [
      r.action?.name,
      r.context,
      r.retailAmount,
      // ...
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(searchQuery.toLowerCase())
  })
  ```

