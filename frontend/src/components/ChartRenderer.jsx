import { useEffect, useState, useCallback, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { getAggregate } from '../services/api'
import { RefreshCw } from 'lucide-react'

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

export default function ChartRenderer({ sessionId, rows = [], values = [], chartType = 'bar' }) {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (sessionId && rows.length > 0 && values.length > 0) {
      loadChartData()
    } else {
      setChartData(null)
    }
  }, [sessionId, rows, values])

  const loadChartData = async () => {
    setLoading(true)
    setError(null)

    try {
      if (values.length === 1) {
        const val = values[0]
        const agg = val.aggregation || 'count'
        const data = await getAggregate(sessionId, rows[0], agg === 'count' ? '' : val.field, agg)
        setChartData({
          labels: data.labels || [],
          series: [{
            name: val.field,
            data: data.values || [],
            aggregation: agg
          }],
          type: 'single'
        })
      } else {
        const seriesData = await Promise.all(
          values.map(async (val) => {
            const agg = val.aggregation || 'count'
            const data = await getAggregate(sessionId, rows[0], agg === 'count' ? '' : val.field, agg)
            return {
              name: `${val.field} (${agg})`,
              data: data.values || [],
              aggregation: agg
            }
          })
        )

        const firstData = seriesData[0]
        setChartData({
          labels: firstData.data.length > 0 ? await getAggregate(sessionId, rows[0], '', 'count').then(d => d.labels || []) : [],
          series: seriesData,
          type: 'multi'
        })
      }
    } catch (err) {
      console.error('Chart data error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getOption = useCallback(() => {
    if (!chartData || !chartData.labels || chartData.labels.length === 0) {
      return null
    }

    const labels = chartData.labels
    const isMulti = chartData.type === 'multi'

    if (chartType === 'bar') {
      if (isMulti) {
        return {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: { data: chartData.series.map(s => s.name) },
          grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
          xAxis: { type: 'category', data: labels, axisLabel: { rotate: 45, fontSize: 11 } },
          yAxis: { type: 'value' },
          dataZoom: [{ type: 'inside' }, { type: 'slider' }],
          series: chartData.series.map((s, i) => ({
            name: s.name,
            type: 'bar',
            data: s.data,
            itemStyle: { color: COLORS[i % COLORS.length] }
          }))
        }
      } else {
        return {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
          xAxis: { type: 'category', data: labels, axisLabel: { rotate: 45, fontSize: 11 } },
          yAxis: { type: 'value' },
          dataZoom: [{ type: 'inside' }, { type: 'slider' }],
          series: [{
            name: chartData.series[0].name,
            type: 'bar',
            data: chartData.series[0].data,
            itemStyle: { color: COLORS[0] },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
          }]
        }
      }
    }

    if (chartType === 'pie') {
      const pieData = labels.map((label, i) => ({
        name: label,
        value: chartData.series[0].data[i] || 0
      }))
      return {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
          data: pieData.map((d, i) => ({
            ...d,
            itemStyle: { color: COLORS[i % COLORS.length] }
          }))
        }]
      }
    }

    if (chartType === 'line') {
      if (isMulti) {
        return {
          tooltip: { trigger: 'axis' },
          legend: { data: chartData.series.map(s => s.name) },
          grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
          xAxis: { type: 'category', boundaryGap: false, data: labels },
          yAxis: { type: 'value' },
          dataZoom: [{ type: 'inside' }, { type: 'slider' }],
          series: chartData.series.map((s, i) => ({
            name: s.name,
            type: 'line',
            smooth: true,
            data: s.data,
            itemStyle: { color: COLORS[i % COLORS.length] },
            lineStyle: { width: 2 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: COLORS[i % COLORS.length] + '40' },
                  { offset: 1, color: COLORS[i % COLORS.length] + '10' }
                ]
              }
            }
          }))
        }
      } else {
        return {
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
          xAxis: { type: 'category', boundaryGap: false, data: labels },
          yAxis: { type: 'value' },
          dataZoom: [{ type: 'inside' }, { type: 'slider' }],
          series: [{
            name: chartData.series[0].name,
            type: 'line',
            smooth: true,
            data: chartData.series[0].data,
            itemStyle: { color: COLORS[0] },
            lineStyle: { width: 3 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: COLORS[0] + '40' },
                  { offset: 1, color: COLORS[0] + '10' }
                ]
              }
            }
          }]
        }
      }
    }

    return null
  }, [chartData, chartType])

  if (rows.length === 0 || values.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">Configure your chart</p>
          <p className="text-sm">Add a dimension to Rows and a metric to Values</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  const option = getOption()
  if (!option) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="h-72">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  )
}