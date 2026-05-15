import { useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, FileUp } from 'lucide-react'
import { LoadingSpinner } from './ui/Skeleton'

export default function FileUploader({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0]
      if (f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
        setFile(f)
      }
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (file) onUpload(file)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`
          dropzone relative overflow-hidden
          ${dragActive ? 'dropzone-active' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-cyan/5" />
        
        <div className="relative z-10 flex flex-col items-center justify-center py-6">
          <div className={`
            w-16 h-16 rounded-xl flex items-center justify-center mb-3
            transition-all duration-300
            ${dragActive 
              ? 'bg-primary-500 scale-110 shadow-glow' 
              : 'bg-slate-800 border border-slate-700'}
          `}>
            {loading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <FileUp className={`w-8 h-8 ${dragActive ? 'text-white' : 'text-slate-400'}`} />
            )}
          </div>
          
          <p className="text-lg font-semibold text-slate-200 mb-1">
            {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
          </p>
          <p className="text-slate-500 mb-4">
            or click to browse from your computer
          </p>
          
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="btn-primary cursor-pointer"
          >
            Choose File
          </label>
          <p className="text-xs text-slate-600 mt-4">
            Supported formats: CSV, Excel (.xlsx, .xls)
          </p>
        </div>
      </div>

      {file && (
        <div className="mt-4 card-dark p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-slate-200">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload & Analyze
              </>
            )}
          </button>
        </div>
      )}

      {/* Sample files hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500 mb-2">Try these sample datasets:</p>
        <div className="flex justify-center gap-2">
          <span className="badge badge-primary">test_dataset.csv</span>
          <span className="badge badge-primary">sample_data.csv</span>
        </div>
      </div>
    </div>
  )
}