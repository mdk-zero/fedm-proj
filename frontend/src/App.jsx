import { useState } from 'react'
import { FilterProvider } from './context/FilterContext'
import FileUploader from './components/FileUploader'
import DataTable from './components/DataTable'
import DataProfiler from './components/DataProfiler'
import DataCleaner from './components/DataCleaner'
import DataComparison from './components/DataComparison'
import InsightsPanel from './components/InsightsPanel'
import MultiChartDashboard from './components/MultiChartDashboard'
import FilterPanel from './components/FilterPanel'
import KPICard from './components/KPICard'
import { uploadFile, getData } from './services/api'
import { Database, BarChart3, Sparkles, GitCompare, TrendingUp } from 'lucide-react'

const stepIcons = [Database, BarChart3, Sparkles, GitCompare, TrendingUp]
const stepDescriptions = [
  'Upload your CSV or Excel file',
  'View data statistics and quality',
  'Clean and transform data',
  'Compare original vs cleaned',
  'Generate insights and visualizations'
]

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [sessionId, setSessionId] = useState(null)
  const [filename, setFilename] = useState(null)
  const [data, setData] = useState(null)
  const [profiling, setProfiling] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUpload = async (file) => {
    setLoading(true)
    setError(null)
    try {
      const result = await uploadFile(file)
      setSessionId(result.session_id)
      setFilename(result.filename)
      setProfiling(result.profiling)
      await loadData(result.session_id)
      setCurrentStep(1)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async (id) => {
    const result = await getData(id)
    setData(result)
    setProfiling(result.profiling)
  }

  const handleClean = async () => {
    await loadData(sessionId)
    setRefreshKey(k => k + 1)
  }

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(c => c + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1)
  }

  const reset = () => {
    setCurrentStep(0)
    setSessionId(null)
    setFilename(null)
    setData(null)
    setProfiling(null)
  }

  const StepIcon = stepIcons[currentStep]
  const steps = ['Upload', 'Profile', 'Clean', 'Compare', 'Insights']

  return (
    <FilterProvider>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-cyan to-primary-600 mb-2">
              Data Cleaning & Analytics
            </h1>
            <p className="text-slate-400 text-lg">Upload, clean, and analyze your datasets with AI-powered insights</p>
          </header>

          {/* Enhanced Stepper */}
          <div className="mb-10">
            <div className="flex items-center justify-center">
              {steps.map((step, idx) => {
                const Icon = stepIcons[idx]
                const isActive = idx === currentStep
                const isCompleted = idx < currentStep
                const isPending = idx > currentStep
                
                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center group">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        transition-all duration-300 border-2
                        ${isActive 
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400 shadow-glow scale-110' 
                          : isCompleted 
                            ? 'bg-primary-900/50 border-primary-500/50 text-primary-400'
                            : 'bg-slate-800 border-slate-700 text-slate-500'}
                      `}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                      </div>
                      <span className={`
                        mt-2 text-xs font-medium transition-colors
                        ${isActive ? 'text-primary-400' : isCompleted ? 'text-primary-400/70' : 'text-slate-500'}
                      `}>{step}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`
                        w-16 h-0.5 mx-2 rounded-full transition-all duration-500
                        ${isCompleted ? 'bg-primary-500' : 'bg-slate-700'}
                      `} />
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-center text-sm text-slate-500 mt-3">
              {stepDescriptions[currentStep]}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 bg-rose-500 rounded-full" />
              <span className="text-rose-400">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-300">✕</button>
            </div>
          )}

          {/* Step Content */}
          {currentStep === 0 && (
            <FileUploader onUpload={handleUpload} loading={loading} />
          )}

          {currentStep === 1 && data && (
            <div className="space-y-6 animate-fade-in">
              <DataProfiler profiling={profiling} filename={filename} />
              <DataTable data={data} />
              <div className="flex justify-between pt-4">
                <button onClick={reset} className="btn-secondary flex items-center gap-2">
                  ← Start Over
                </button>
                <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                  Continue to Cleaning →
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && data && (
            <div className="space-y-6 animate-fade-in">
              <DataCleaner sessionId={sessionId} columns={data.columns} onClean={handleClean} />
              <div className="flex justify-between pt-4">
                <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
                  ← Back to Profile
                </button>
                <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                  Continue to Compare →
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && sessionId && (
            <div className="space-y-6 animate-fade-in">
              <DataComparison sessionId={sessionId} />
              <div className="flex justify-between pt-4">
                <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
                  ← Back to Cleaning
                </button>
                <button onClick={handleNext} className="btn-primary flex items-center gap-2">
                  Continue to Insights →
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && sessionId && (
            <div className="space-y-6 animate-fade-in">
              <KPICard sessionId={sessionId} refreshKey={refreshKey} />
              <FilterPanel sessionId={sessionId} />
              <InsightsPanel sessionId={sessionId} refreshKey={refreshKey} />
              
              <div className="card-dark p-6">
                <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  Interactive Dashboard
                </h2>
                <MultiChartDashboard sessionId={sessionId} />
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
                  ← Back to Compare
                </button>
                <button onClick={reset} className="btn-primary flex items-center gap-2">
                  Start New Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </FilterProvider>
  )
}

export default App