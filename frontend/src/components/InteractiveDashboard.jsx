import { useEffect, useState, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import { BarChart3, PieChart, LineChart, Activity, RefreshCw, Download } from 'lucide-react'
import { getAggregate, getTimeSeries, getFilterOptions } from '../services/api'
import { useFilters } from '../context/FilterContext'

const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

export default function InteractiveDashboard({ sessionId, columns = [] }) {
  const [chartData, setChartData] = useState({})
  const [timeData, setTimeData] = useState(null)
  const [filterOptions, setFilterOptions] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeChart, setActiveChart] = useState('bar')
  const [selectedDimension, setSelectedDimension] = useState('')
  const [selectedMetric, setSelectedMetric] = useState('')
  const [aggregation, setAggregation] = useState('sum')
  const [zoomRange, setZoomRange] = useState([0, 100])
  const { filters, setFilter } = useFilters()

  useEffect(() => {
    if (sessionId && columns.length > 0) {
      loadInitialData()
    }
  }, [sessionId])

  useEffect(() => {
    if (sessionId && selectedDimension) {
      loadChartData()
    }
  }, [sessionId, selectedDimension, selectedMetric, aggregation, filters])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const options = await getFilterOptions(sessionId)
      setFilterOptions(options)

      const dims = Object.keys(options)
      if (dims.length > 0) {
        setSelectedDimension(dims[0])
      }

      const numericCols = columns.filter(c => {
        const type = options[c]?.toString?.() || ''
        return false
      }).length > 0 ? columns : columns.filter(c => {
        return !dims.includes(c)
      })

      if (numericCols.length > 0) {
        setSelectedMetric(numericCols[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async () => {
    if (!selectedDimension) return

    try {
      const data = await getAggregate(sessionId, selectedDimension, selectedMetric, aggregation)
      setChartData(data)

      const numericCols = columns.filter(c => {
        const opt = filterOptions[c]
        return opt === undefined
      })

      if (numericCols.length > 0) {
        try {
          const time = await getTimeSeries(sessionId, selectedDimension, numericCols[0], aggregation)
          if (time && time.labels && time.labels.length > 0) {
            setTimeData(time)
          }
        } catch (e) {
          setTimeData(null)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getBarChartOption = useCallback(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0]
        return `<b>${p.name}</b><br/>Value: ${p.value.toLocaleString()}`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: chartData.labels || [],
      axisLabel: { rotate: 45, fontSize: 11 },
      axisTick: { alignWithLabel: true }
    },
    yAxis: { type: 'value' },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [{
      name: selectedDimension,
      type: 'bar',
      data: chartData.values || [],
      itemStyle: {
        color: (params) => CHART_COLORS[params.dataIndex % CHART_COLORS.length]
      },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
      }
    }]
  }), [chartData, selectedDimension])

  const getPieChartOption = useCallback(() => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { fontSize: 11 }
    },
    series: [{
      name: selectedDimension,
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' }
      },
      data: (chartData.labels || []).map((label, i) => ({
        name: label,
        value: chartData.values?.[i] || 0,
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] }
      }))
    }]
  }), [chartData, selectedDimension])

  const getLineChartOption = useCallback(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        return `<b>${p.name}</b><br/>${p.seriesName}: ${p.value?.toLocaleString() || 'N/A'}`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeData?.labels || chartData.labels || []
    },
    yAxis: { type: 'value' },
    dataZoom: [
      { type: 'inside', start: zoomRange[0], end: zoomRange[1] },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [{
      name: selectedMetric || selectedDimension,
      type: 'line',
      smooth: true,
      data: timeData?.values || chartData.values || [],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
          ]
        }
      },
      itemStyle: { color: '#3B82F6' },
      lineStyle: { width: 3 }
    }]
  }), [chartData, timeData, selectedDimension, selectedMetric, zoomRange])

  const getGaugeOption = useCallback(() => {
    const total = chartData.values?.reduce((a, b) => a + b, 0) || 0
    const avg = chartData.values?.length ? total / chartData.values.length : 0
    return {
      series: [{
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: avg * 2,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[0.5, '#3B82F6'], [0.8, '#10B981'], [1, '#EF4444']]
          }
        },
        pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 20 },
        axisTick: { length: 12, lineStyle: { color: 'auto', width: 2 } },
        splitLine: { length: 20, lineStyle: { color: 'auto', width: 5 } },
        axisLabel: { color: '#464646', fontSize: 12, distance: 25 },
        detail: {
          formatter: '{value}',
          color: 'auto',
          fontSize: 30,
          offsetCenter: [0, '70%']
        },
        data: [{ value: Math.round(avg), name: 'Average' }]
      }]
    }
  }, [chartData])

  const getOption = () => {
    switch (activeChart) {
      case 'bar': return getBarChartOption()
      case 'pie': return getPieChartOption()
      case 'line': return getLineChartOption()
      case 'gauge': return getGaugeOption()
      default: return getBarChartOption()
    }
  }

  const chartTypes = [
    { id: 'bar', icon: BarChart3, label: 'Bar' },
    { id: 'pie', icon: PieChart, label: 'Pie' },
    { id: 'line', icon: LineChart, label: 'Line' },
    { id: 'gauge', icon: Activity, label: 'Gauge' }
  ]

  const aggregations = [
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'max', label: 'Max' },
    { value: 'min', label: 'Min' }
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  }

  const numericCols = columns.filter(c => !filterOptions[c])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Interactive Dashboard</h2>
        
        <div className="flex items-center gap-2">
          {chartTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveChart(type.id)}
              className={`p-2 rounded-lg flex items-center gap-1 text-sm ${
                activeChart === type.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <type.icon className="h-4 w-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Dimension (Group By)</label>
          <select
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm min-w-[160px]"
          >
            {Object.keys(filterOptions).map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {numericCols.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm min-w-[140px]"
            >
              <option value="">Count Only</option>
              {numericCols.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Aggregation</label>
          <select
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm min-w-[100px]"
          >
            {aggregations.map(agg => (
              <option key={agg.value} value={agg.value}>{agg.label}</option>
            ))}
          </select>
        </div>

        {Object.keys(filterOptions).length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quick Filter</label>
            <select
              value={filters[selectedDimension] || ''}
              onChange={(e) => setFilter(selectedDimension, e.target.value || null)}
              className="px-3 py-2 border rounded-lg text-sm min-w-[140px]"
            >
              <option value="">All</option>
              {(filterOptions[selectedDimension] || []).map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="h-96">
        <ReactECharts
          option={getOption()}
          style={{ height: '100%', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          {chartData.labels?.length || 0} categories • Total: {chartData.values?.reduce((a, b) => a + b, 0)?.toLocaleString() || 0}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs">Use mouse wheel to zoom • Drag to pan</span>
        </div>
      </div>
    </div>
  )
}