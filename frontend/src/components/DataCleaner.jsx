import { useState } from 'react'
import { cleanData } from '../services/api'
import { Trash2, ArrowLeftRight, Filter, RefreshCw } from 'lucide-react'

export default function DataCleaner({ sessionId, columns, onClean }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [selectedColumn, setSelectedColumn] = useState('')
  const [missingMethod, setMissingMethod] = useState('drop')
  const [dtype, setDtype] = useState('numeric')
  const [filterColumn, setFilterColumn] = useState('')
  const [filterOp, setFilterOp] = useState('isna')
  const [filterValue, setFilterValue] = useState('')

  const handleRemoveDuplicates = async () => {
    setLoading(true)
    try {
      const result = await cleanData(sessionId, 'remove_duplicates')
      setMessage(result.message)
      onClean()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.detail || 'Failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleMissing = async () => {
    setLoading(true)
    try {
      const result = await cleanData(sessionId, 'handle_missing', {
        column: selectedColumn || null,
        method: missingMethod
      })
      setMessage(result.message)
      onClean()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.detail || 'Failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async () => {
    if (!selectedColumn) return
    setLoading(true)
    try {
      const result = await cleanData(sessionId, 'convert_dtype', {
        column: selectedColumn,
        dtype
      })
      setMessage(result.message)
      onClean()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.detail || 'Failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = async () => {
    if (!filterColumn) return
    setLoading(true)
    try {
      const condition = { operator: filterOp }
      if (filterOp !== 'isna' && filterOp !== 'notna') {
        condition.value = filterValue
      }
      const result = await cleanData(sessionId, 'filter_invalid', {
        column: filterColumn,
        condition
      })
      setMessage(result.message)
      onClean()
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.detail || 'Failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-dark p-6">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Data Cleaning Operations</h2>

      {message && (
        <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg text-primary-400">
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-rose-500" />
            <h3 className="font-semibold text-slate-200">Remove Duplicates</h3>
          </div>
          <button
            onClick={handleRemoveDuplicates}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-lg hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 transition-all"
          >
            Remove Duplicate Rows
          </button>
        </div>

        <div className="space-y-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-slate-200">Handle Missing Values</h3>
          </div>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="select-dark w-full"
          >
            <option value="">All columns</option>
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
          <select
            value={missingMethod}
            onChange={(e) => setMissingMethod(e.target.value)}
            className="select-dark w-full"
          >
            <option value="drop">Drop rows with missing</option>
            <option value="mean">Fill with mean (numeric)</option>
            <option value="median">Fill with median (numeric)</option>
            <option value="mode">Fill with mode</option>
          </select>
          <button
            onClick={handleMissing}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 disabled:opacity-50 transition-all"
          >
            Apply
          </button>
        </div>

        <div className="space-y-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-violet-500" />
            <h3 className="font-semibold text-slate-200">Convert Data Type</h3>
          </div>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="select-dark w-full"
          >
            <option value="">Select column</option>
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
          <select
            value={dtype}
            onChange={(e) => setDtype(e.target.value)}
            className="select-dark w-full"
          >
            <option value="numeric">Numeric</option>
            <option value="datetime">DateTime</option>
            <option value="string">String</option>
            <option value="category">Category</option>
          </select>
          <button
            onClick={handleConvert}
            disabled={loading || !selectedColumn}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-lg hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 transition-all"
          >
            Convert Type
          </button>
        </div>

        <div className="space-y-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-cyan-500" />
            <h3 className="font-semibold text-slate-200">Filter Invalid Data</h3>
          </div>
          <select
            value={filterColumn}
            onChange={(e) => setFilterColumn(e.target.value)}
            className="select-dark w-full"
          >
            <option value="">Select column</option>
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
          <select
            value={filterOp}
            onChange={(e) => setFilterOp(e.target.value)}
            className="select-dark w-full"
          >
            <option value="isna">Is Null/NaN</option>
            <option value="notna">Is Not Null</option>
            <option value="==">Equals</option>
            <option value="!=">Not Equals</option>
            <option value=">">Greater Than</option>
            <option value="<">Less Than</option>
            <option value=">=">Greater or Equal</option>
            <option value="<=">Less or Equal</option>
          </select>
          {filterOp !== 'isna' && filterOp !== 'notna' && (
            <input
              type="text"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Value"
              className="input-dark w-full"
            />
          )}
          <button
            onClick={handleFilter}
            disabled={loading || !filterColumn}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 transition-all"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  )
}