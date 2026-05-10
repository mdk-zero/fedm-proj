import { createContext, useContext, useState, useCallback } from 'react'

const FilterContext = createContext()

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({})
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [chartInteractions, setChartInteractions] = useState({})

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({})
    setSelectedPoint(null)
    setChartInteractions({})
  }, [])

  const setChartInteraction = useCallback((chartId, data) => {
    setChartInteractions(prev => ({
      ...prev,
      [chartId]: data
    }))
  }, [])

  const selectPoint = useCallback((point, chartId) => {
    setSelectedPoint({ point, chartId })
    setChartInteraction(chartId, point)
  }, [setChartInteraction])

  return (
    <FilterContext.Provider value={{
      filters,
      setFilter,
      clearFilter,
      clearAllFilters,
      selectedPoint,
      selectPoint,
      chartInteractions,
      setChartInteraction
    }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider')
  }
  return context
}