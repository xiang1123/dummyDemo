export interface TablePageData<T> {
  list: T[]
  total: number
}

interface UseTablePageOptions<T> {
  initialPageSize?: number
  loadData: (params: { currentPage: number; pageSize: number }) => Promise<TablePageData<T>>
}

export const useTablePage = <T>(options: UseTablePageOptions<T>) => {
  const loading = ref(false)
  const tableData = ref<T[]>([])
  const currentPage = ref(1)
  const pageSize = ref(options.initialPageSize ?? 10)
  const total = ref(0)

  const fetchTableData = async () => {
    loading.value = true
    try {
      const res = await options.loadData({
        currentPage: currentPage.value,
        pageSize: pageSize.value,
      })
      tableData.value = res.list
      total.value = res.total
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    currentPage.value = 1
    fetchTableData()
  }

  return {
    loading,
    tableData,
    currentPage,
    pageSize,
    total,
    fetchTableData,
    handleSearch,
  }
}
