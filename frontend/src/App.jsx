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
import { Database, BarChart3, Sparkles, GitCompare, TrendingUp, BarChart, Filter, Sparkle, ChevronDown, ChevronUp } from 'lucide-react'

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
    const result = await getData(id, 1, 100000)
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
      <div className="h-screen flex flex-col p-6">
        <div className="max-w-7xl mx-auto flex-1 flex flex-col">
          {/* Header */}
          <header className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-accent-cyan to-primary-600 mb-1">
              Data Cleaning & Analytics
            </h1>
            <p className="text-slate-400 text-sm">Upload, clean, and analyze your datasets with AI-powered insights</p>
          </header>

          {/* Enhanced Stepper */}
          <div className="mb-4">
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
                        w-8 h-8 rounded-lg flex items-center justify-center
                        transition-all duration-300 border
                        ${isActive
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-primary-400'
                          : isCompleted
                            ? 'bg-primary-900/50 border-primary-500/50 text-primary-400'
                            : 'bg-slate-800 border-slate-700 text-slate-500'}
                      `}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />
                      </div>
                      <span className={`
                        mt-1 text-[16px] font-medium transition-colors
                        ${isActive ? 'text-primary-400' : isCompleted ? 'text-primary-400/70' : 'text-slate-500'}
                      `}>{step}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`
                        w-8 h-0.5 mx-1 rounded-full transition-all duration-500
                        ${isCompleted ? 'bg-primary-500' : 'bg-slate-700'}
                      `} />
                    )}
                  </div>
                )
              })}
            </div>
            <p className="text-center text-md text-slate-500 mt-3">
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
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {currentStep === 0 && (
              <div className="flex-1 flex items-center justify-center min-h-0">
                <FileUploader onUpload={handleUpload} loading={loading} />
              </div>
            )}

            {currentStep === 1 && data && (
              <div className="flex flex-col h-full min-h-0 animate-fade-in gap-2">
                <div className="flex flex-1 min-h-0 gap-3">
                  <div className="w-96 shrink-0">
                    <DataProfiler profiling={profiling} filename={filename} />
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <DataTable sessionId={sessionId} maxHeight="h-full" />
                  </div>
                </div>
                <div className="flex justify-between shrink-0 pt-2 border-t border-slate-700/50">
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
              <InsightsPage
                sessionId={sessionId}
                refreshKey={refreshKey}
                onBack={handleBack}
                onReset={reset}
              />
            )}
          </div>
        </div>
      </div>
    </FilterProvider>
  )
}

function InsightsPage({ sessionId, refreshKey, onBack, onReset }) {
  const [activeTab, setActiveTab] = useState('charts')
  const [expandedSections, setExpandedSections] = useState({
    kpi: true,
    filters: true,
    insights: true
  })

  const tabs = [
    { id: 'charts', label: 'Charts', icon: BarChart },
    { id: 'insights', label: 'Data Insights', icon: Sparkle },
    { id: 'kpi', label: 'KPIs & Filters', icon: Filter }
  ]

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="flex flex-col h-full min-h-0 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 p-1 bg-slate-800/50 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
              ? 'bg-primary-500 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'charts' && (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <MultiChartDashboard sessionId={sessionId} />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="h-full overflow-y-auto custom-scrollbar space-y-4">
            <InsightsPanel sessionId={sessionId} refreshKey={refreshKey} />
          </div>
        )}

        {activeTab === 'kpi' && (
          <div className="h-full overflow-y-auto custom-scrollbar space-y-4">
            <CollapsibleSection
              title="Key Performance Indicators"
              expanded={expandedSections.kpi}
              onToggle={() => toggleSection('kpi')}
            >
              <KPICard sessionId={sessionId} refreshKey={refreshKey} />
            </CollapsibleSection>

            <CollapsibleSection
              title="Filters (Slicers)"
              expanded={expandedSections.filters}
              onToggle={() => toggleSection('filters')}
            >
              <FilterPanel sessionId={sessionId} />
            </CollapsibleSection>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 mt-4 border-t border-slate-700">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          ← Back to Compare
        </button>
        <button onClick={onReset} className="btn-primary flex items-center gap-2">
          Start New Analysis
        </button>
      </div>
    </div>
  )
}

function CollapsibleSection({ title, expanded, onToggle, children }) {
  return (
    <div className="card-dark">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
      >
        <span className="font-semibold text-slate-200">{title}</span>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default App
