import { useState, useEffect } from 'react'
import { Filter, X, ChevronDown } from 'lucide-react'
import { getFilterOptions } from '../services/api'
import { useFilters } from '../context/FilterContext'
import { LoadingSpinner } from './ui/Skeleton'

export default function FilterPanel({ sessionId }) {
  const [filterOptions, setFilterOptions] = useState({})
  const [loading, setLoading] = useState(true)
  const { filters, setFilter, clearFilter, clearAllFilters } = useFilters()
  const [openDropdown, setOpenDropdown] = useState(null)

  useEffect(() => {
    if (sessionId) {
      loadFilterOptions()
    }
  }, [sessionId])

  const loadFilterOptions = async () => {
    try {
      const options = await getFilterOptions(sessionId)
      setFilterOptions(options)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card-dark p-4">
        <LoadingSpinner />
      </div>
    )
  }

  const activeFilters = Object.keys(filters).filter(k => filters[k])

  return (
    <div className="card-dark p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary-400" />
          <h3 className="font-semibold text-slate-200">Filters (Slicers)</h3>
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Clear All
          </button>
        )}
      </div>

      {Object.keys(filterOptions).length === 0 ? (
        <p className="text-sm text-slate-500">No categorical columns available for filtering</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(filterOptions).slice(0, 6).map(([column, values]) => (
            <div key={column} className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === column ? null : column)}
                className={`w-full px-3 py-2.5 text-left text-sm border rounded-lg flex items-center justify-between transition-all ${
                  filters[column] 
                    ? 'border-primary-500 bg-primary-500/10 text-primary-400' 
                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 text-slate-300 hover:text-slate-100'
                }`}
              >
                <span className="truncate font-medium">{column}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>

              {openDropdown === column && (
                <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      clearFilter(column)
                      setOpenDropdown(null)
                    }}
                    className="w-full px-3 py-2.5 text-left text-sm text-slate-400 hover:bg-slate-700 border-b border-slate-700"
                  >
                    All {column}
                  </button>
                  {values.map((value) => (
                    <button
                      key={value}
                      onClick={() => {
                        setFilter(column, value)
                        setOpenDropdown(null)
                      }}
                      className={`w-full px-3 py-2.5 text-left text-sm hover:bg-slate-700 transition-colors ${
                        filters[column] === value ? 'bg-primary-500/10 text-primary-400' : 'text-slate-300'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeFilters.map(key => (
            <span
              key={key}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/30 text-primary-400 rounded-full text-sm"
            >
              <span className="font-medium">{key}:</span>
              <span>{filters[key]}</span>
              <button onClick={() => clearFilter(key)} className="hover:text-primary-300">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}