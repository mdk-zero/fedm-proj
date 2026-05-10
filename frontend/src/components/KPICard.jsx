import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, DollarSign, BarChart3, Hash, Percent, Activity } from 'lucide-react'
import { getKPI } from '../services/api'
import { Skeleton } from './ui/Skeleton'

export default function KPICard({ sessionId, refreshKey }) {
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      loadKPIs()
    }
  }, [sessionId, refreshKey])

  const loadKPIs = async () => {
    setLoading(true)
    try {
      const data = await getKPI(sessionId)
      setKpis(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="kpi-card">
            <Skeleton variant="text" className="w-20 mb-2" />
            <Skeleton variant="title" />
          </div>
        ))}
      </div>
    )
  }

  if (!kpis) return null

  const formatValue = (key, value) => {
    if (key.includes('salary') || key.includes('revenue') || key.includes('amount') || key.includes('cost')) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
    }
    if (key.includes('rate') || key.includes('percent')) {
      return `${value}%`
    }
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    return value
  }

  const getIcon = (key) => {
    if (key.includes('salary') || key.includes('revenue') || key.includes('amount')) return DollarSign
    if (key === 'total_rows') return Hash
    if (key.includes('rate') || key.includes('percent')) return Percent
    return BarChart3
  }

  const getTrend = (key) => {
    if (key === 'total_rows') return 'neutral'
    const avg = kpis[`${key.replace('_sum', '')}_avg`] || 0
    const max = kpis[`${key.replace('_sum', '')}_max`] || 0
    if (avg > 0 && max > avg * 1.2) return 'up'
    if (avg > 0 && max < avg * 0.8) return 'down'
    return 'neutral'
  }

  const cards = []

  if (kpis.total_rows !== undefined) {
    cards.push({
      label: 'Total Records',
      value: kpis.total_rows,
      key: 'total_rows',
      trend: 'neutral',
      icon: Hash,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    })
  }

  Object.entries(kpis).forEach(([key, value]) => {
    if (key !== 'total_rows' && key.includes('_sum')) {
      cards.push({
        label: key.replace('_sum', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value,
        key,
        trend: getTrend(key)
      })
    }
  })

  if (cards.length === 0) {
    return <div className="text-slate-500 text-center py-4">No KPIs available</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.slice(0, 4).map((card) => {
        const Icon = getIcon(card.key)
        const trendIcon = card.trend === 'up' ? TrendingUp : card.trend === 'down' ? TrendingDown : Minus
        const trendColor = card.trend === 'up' ? 'text-emerald-400' : card.trend === 'down' ? 'text-rose-400' : 'text-slate-400'
        
        return (
          <div key={card.key} className="kpi-card group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-400">{card.label}</span>
              <div className={`
                p-2 rounded-lg border
                ${card.key === 'total_rows' 
                  ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' 
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'}
              `}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-100">
                {formatValue(card.key, card.value)}
              </span>
              <div className={`${trendColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                {trendIcon === TrendingUp && <TrendingUp className="h-5 w-5" />}
                {trendIcon === TrendingDown && <TrendingDown className="h-5 w-5" />}
                {trendIcon === Minus && <Minus className="h-5 w-5" />}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}