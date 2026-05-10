import { useState, useEffect } from 'react'
import { Plus, Save, FolderOpen, Layout, Grid, X } from 'lucide-react'
import ChartCard from './ChartCard'
import { getColumnTypes } from '../services/api'

const STORAGE_KEY = 'analytics-dashboard-layouts'

export default function MultiChartDashboard({ sessionId, initialCharts = [] }) {
  const [charts, setCharts] = useState(initialCharts)
  const [columnTypes, setColumnTypes] = useState({})
  const [showLoadMenu, setShowLoadMenu] = useState(false)
  const [savedLayouts, setSavedLayouts] = useState([])

  useEffect(() => {
    loadColumnTypes()
    loadSavedLayouts()
  }, [sessionId])

  useEffect(() => {
    if (initialCharts.length === 0 && charts.length === 0) {
      addNewChart()
    }
  }, [])

  const loadColumnTypes = async () => {
    if (!sessionId) return
    try {
      const types = await getColumnTypes(sessionId)
      setColumnTypes(types)
    } catch (err) {
      console.error('Failed to load column types:', err)
    }
  }

  const loadSavedLayouts = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setSavedLayouts(JSON.parse(saved))
      }
    } catch (err) {
      console.error('Failed to load layouts:', err)
    }
  }

  const saveLayout = (name) => {
    const layout = {
      name: name || `Layout ${savedLayouts.length + 1}`,
      timestamp: new Date().toISOString(),
      charts: charts
    }
    const updated = [...savedLayouts, layout]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setSavedLayouts(updated)
  }

  const loadLayout = (layout) => {
    setCharts(layout.charts)
    setShowLoadMenu(false)
  }

  const deleteLayout = (idx) => {
    const updated = savedLayouts.filter((_, i) => i !== idx)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setSavedLayouts(updated)
  }

  const addNewChart = () => {
    const newChart = {
      id: `chart-${Date.now()}`,
      title: '',
      rows: [],
      values: [],
      chartType: 'bar'
    }
    setCharts([...charts, newChart])
  }

  const updateChart = (id, updates) => {
    setCharts(charts.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteChart = (id) => {
    if (charts.length === 1) {
      return
    }
    setCharts(charts.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={addNewChart}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chart
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const name = prompt('Enter a name for this layout:')
              if (name) {
                saveLayout(name)
              }
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Layout
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowLoadMenu(!showLoadMenu)}
              className="btn-secondary flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Load Layout
            </button>
            
            {showLoadMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 card-dark z-20">
                <div className="px-4 py-3 border-b border-slate-700">
                  <span className="font-medium text-slate-200">Saved Layouts</span>
                </div>
                {savedLayouts.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 text-center">
                    No saved layouts yet
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {savedLayouts.map((layout, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 hover:bg-slate-700/50 border-b border-slate-700 last:border-b-0 cursor-pointer"
                        onClick={() => loadLayout(layout)}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-slate-200">{layout.name}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(layout.timestamp).toLocaleDateString()} • {layout.charts.length} charts
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLayout(idx)
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {charts.length === 0 && (
        <div className="card-dark p-12 text-center">
          <Grid className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-2">No charts yet</p>
          <p className="text-slate-500 text-sm mb-4">Click "New Chart" to create your first visualization</p>
          <button onClick={addNewChart} className="btn-primary">
            Create First Chart
          </button>
        </div>
      )}

      {/* Chart Cards */}
      <div className="space-y-6">
        {charts.map(chart => (
          <ChartCard
            key={chart.id}
            id={chart.id}
            title={chart.title}
            rows={chart.rows}
            values={chart.values}
            chartType={chart.chartType}
            columnTypes={columnTypes}
            sessionId={sessionId}
            onUpdate={(updates) => updateChart(chart.id, updates)}
            onDelete={() => deleteChart(chart.id)}
            canDelete={charts.length > 1}
          />
        ))}
      </div>

      {/* Close menu on outside click */}
      {showLoadMenu && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowLoadMenu(false)}
        />
      )}
    </div>
  )
}