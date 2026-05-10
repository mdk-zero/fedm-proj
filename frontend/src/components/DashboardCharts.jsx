import { useEffect, useState } from 'react'
import { getChartData } from '../services/api'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardCharts({ sessionId, columns }) {
  const [chartData, setChartData] = useState(null)
  const [selectedColumn, setSelectedColumn] = useState('')
  const [chartType, setChartType] = useState('bar')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (columns.length > 0 && !selectedColumn) {
      setSelectedColumn(columns[0])
    }
  }, [columns])

  useEffect(() => {
    if (selectedColumn) {
      fetchChartData()
    }
  }, [selectedColumn, chartType, sessionId])

  const fetchChartData = async () => {
    setLoading(true)
    try {
      const result = await getChartData(sessionId, selectedColumn, chartType)
      setChartData(result)
    } catch (err) {
      console.error(err)
      setChartData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard Visualization</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Column</label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="p-2 border rounded"
          >
            {columns.map(col => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
          <div className="flex gap-2">
            {['bar', 'line', 'pie'].map(type => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-2 rounded text-sm capitalize ${
                  chartType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading chart...</p>
          </div>
        ) : !chartData || !chartData.labels || chartData.labels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No chart data available for this column</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' && (
              <BarChart data={chartData.labels.map((label, i) => ({
                name: label,
                value: chartData.datasets[0].data[i]
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            )}

            {chartType === 'line' && (
              <LineChart data={chartData.labels.map((label, i) => ({
                name: label,
                value: chartData.datasets[0].data[i]
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" />
              </LineChart>
            )}

            {chartType === 'pie' && (
              <PieChart>
                <Pie
                  data={chartData.labels.map((label, i) => ({
                    name: label,
                    value: chartData.datasets[0].data[i]
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {chartData.labels.map((_, i) => (
                    <Cell key={i} fill={chartData.datasets[0].backgroundColor[i % 10]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}