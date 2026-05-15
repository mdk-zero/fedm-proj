# Data Cleaning and Analytics System

BAT403 – Foundations of Enterprise Data Management

## Overview

A web-based system for uploading tabular datasets (CSV/Excel), performing data cleaning operations, and generating insights with visualizations.

## Workflow

```
Upload → Profile → Clean → Compare → Insights → Visualize
```

## Features

### 1. Data Input
- Upload CSV or Excel files
- Drag-and-drop interface

### 2. Data Profiling
- Row and column counts
- Data type detection
- Missing value identification
- Basic statistics (mean, median, min, max, std)

### 3. Data Cleaning
| Operation | Description |
|-----------|-------------|
| Remove Duplicates | Drop duplicate rows |
| Handle Missing | Drop rows / fill with mean/median/mode |
| Convert Type | Convert to numeric, datetime, string, category |
| Filter Invalid | Filter by conditions (equals, greater than, etc.) |

### 4. Data Comparison
- Side-by-side view of original vs cleaned data
- Change summary

### 5. Insights Generation
- Summary statistics for numeric columns
- Most frequent values
- Trend detection (increasing/decreasing/stable)

### 6. Dashboard Visualization
- Bar chart
- Line chart
- Pie chart
- Selectable columns and chart types

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The backend API will be available at http://localhost:8000

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:5173

## Usage

1. Open http://localhost:5173
2. Upload a CSV or Excel file
3. View data profiling results
4. Apply cleaning operations
5. Compare original and cleaned data
6. Generate insights
7. Create visualizations

## Sample Data

A sample dataset is provided in `sample_data.csv` with:
- 30 rows of employee data
- Missing values in various columns
- Duplicate entries
- Various data types

## Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, Pandas, OpenPyXL |
| Frontend | React 18, TailwindCSS, Recharts |
| Build | Vite |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /upload | Upload CSV/Excel file |
| GET | /data/{session_id} | Get dataset with profiling |
| POST | /clean/{session_id} | Apply cleaning operations |
| GET | /compare/{session_id} | Get comparison |
| GET | /insights/{session_id} | Generate insights |
| GET | /chart-data/{session_id} | Get chart data |