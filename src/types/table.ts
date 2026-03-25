export interface SearchOption {
  label: string
  value: string | number | boolean
}

export interface ColumnSearch {
  type?: string
  options?: SearchOption[]
}

export interface TableColumn {
  prop?: string
  label: string
  width?: number
  minWidth?: number
  align?: string
  fixed?: string | boolean
  slot?: string
  tooltip?: boolean
  search?: ColumnSearch
}
