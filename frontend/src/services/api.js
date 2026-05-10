import axios from 'axios'

const API_BASE = '/api'

export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`${API_BASE}/upload`, formData)
  return response.data
}

export const getData = async (sessionId, page = 1, limit = 50) => {
  const response = await axios.get(`${API_BASE}/data/${sessionId}`, {
    params: { page, limit }
  })
  return response.data
}

export const cleanData = async (sessionId, operation, options = {}) => {
  const response = await axios.post(`${API_BASE}/clean/${sessionId}`, {
    operation,
    ...options
  })
  return response.data
}

export const compareData = async (sessionId) => {
  const response = await axios.get(`${API_BASE}/compare/${sessionId}`)
  return response.data
}

export const getInsights = async (sessionId) => {
  const response = await axios.get(`${API_BASE}/insights/${sessionId}`)
  return response.data
}

export const getChartData = async (sessionId, column, chartType = 'bar') => {
  const response = await axios.get(`${API_BASE}/chart-data/${sessionId}`, {
    params: { column, chart_type: chartType }
  })
  return response.data
}

export const getColumns = async (sessionId) => {
  const response = await axios.get(`${API_BASE}/columns/${sessionId}`)
  return response.data
}

export const getAggregate = async (sessionId, dimension, metric = '', agg = 'sum') => {
  const response = await axios.get(`${API_BASE}/aggregate/${sessionId}`, {
    params: { dimension, metric, agg }
  })
  return response.data
}

export const getKPI = async (sessionId) => {
  const response = await axios.get(`${API_BASE}/kpi/${sessionId}`)
  return response.data
}

export const getTimeSeries = async (sessionId, dimension, metric, agg = 'sum') => {
  const response = await axios.get(`${API_BASE}/timeseries/${sessionId}`, {
    params: { dimension, metric, agg }
  })
  return response.data
}

export const getFilterOptions = async (sessionId) => {
  const response = await axios.get(`${API_BASE}/filter-options/${sessionId}`)
  return response.data
}

export const getColumnTypes = async (sessionId) => {
  const response = await axios.get(`${API_BASE}/columns/${sessionId}/types`)
  return response.data
}