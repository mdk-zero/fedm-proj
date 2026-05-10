import { X, BarChart2, Hash } from 'lucide-react'

const AGGREGATIONS = [
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' }
]

export default function FieldWell({ 
  type,  // 'rows' or 'values'
  items = [],
  onRemove,
  onAggregationChange
}) {
  const isRows = type === 'rows'

  return (
    <div className={`p-3 rounded-lg border-2 border-dashed ${
      isRows ? 'border-blue-200 bg-blue-30' : 'border-green-200 bg-green-30'
    } min-h-[80px]`}>
      <div className="text-xs font-medium text-gray-500 mb-2 uppercase">
        {isRows ? 'Rows (Dimension)' : 'Values (Metrics)'}
      </div>
      
      {items.length === 0 ? (
        <div className="text-xs text-gray-400 text-center py-4">
          {isRows ? 'Click a dimension field to add' : 'Click a metric to add'}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                isRows 
                  ? 'bg-white border-blue-300' 
                  : 'bg-white border-green-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {isRows ? (
                  <Hash className="h-3.5 w-3.5 text-blue-600" />
                ) : (
                  <BarChart2 className="h-3.5 w-3.5 text-green-600" />
                )}
                <span className="text-sm font-medium text-gray-700">{item.field}</span>
              </div>
              
              {!isRows && (
                <select
                  value={item.aggregation || 'count'}
                  onChange={(e) => onAggregationChange(idx, e.target.value)}
                  className="text-xs px-2 py-1 border rounded bg-gray-50 ml-2"
                >
                  {AGGREGATIONS.map(agg => (
                    <option key={agg.value} value={agg.value}>{agg.label}</option>
                  ))}
                </select>
              )}
              
              <button
                onClick={() => onRemove(idx)}
                className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}