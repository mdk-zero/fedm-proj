from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.data_processor import processor, load_data
from app.models import (
    CleaningRequest, ProfilingResponse, DataResponse,
    ComparisonResponse, InsightsResponse, ChartDataResponse
)
from typing import List, Dict, Any
import pandas as pd


app = FastAPI(title="Data Cleaning and Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Data Cleaning and Analytics API", "version": "1.0.0"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)) -> Dict[str, Any]:
    try:
        content = await file.read()
        df = load_data(content, file.filename)
        session_id = processor.create_session(df)
        profiling = processor.profile_data(df)
        return {
            "session_id": session_id,
            "filename": file.filename,
            "profiling": profiling
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/data/{session_id}")
def get_data(session_id: str, page: int = 1, limit: int = 50) -> DataResponse:
    df = processor.get_data(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")

    profiling = processor.profile_data(df)
    start = (page - 1) * limit
    end = start + limit
    data = df.iloc[start:end].to_dict("records")

    return {
        "data": data,
        "columns": list(df.columns),
        "profiling": profiling
    }


@app.post("/clean/{session_id}")
def clean_data(session_id: str, request: CleaningRequest) -> Dict[str, Any]:
    df = processor.get_data(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if request.operation == "handle_missing":
        processor.handle_missing(session_id, request.column, request.method)
    elif request.operation == "remove_duplicates":
        removed = processor.remove_duplicates(session_id)
        return {"message": f"Removed {removed} duplicate rows"}
    elif request.operation == "convert_dtype":
        success = processor.convert_dtype(session_id, request.column, request.dtype)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to convert dtype")
    elif request.operation == "filter_invalid":
        removed = processor.filter_invalid(session_id, request.column, request.condition)
        return {"message": f"Filtered {removed} invalid rows"}

    df = processor.get_data(session_id)
    profiling = processor.profile_data(df)

    return {
        "message": f"Applied {request.operation}",
        "profiling": profiling
    }


@app.get("/compare/{session_id}")
def compare_data(session_id: str) -> ComparisonResponse:
    comparison = processor.get_comparison(session_id)
    if not comparison:
        raise HTTPException(status_code=404, detail="Session not found")
    return comparison


@app.get("/insights/{session_id}")
def get_insights(session_id: str) -> InsightsResponse:
    insights = processor.get_insights(session_id)
    if not insights:
        raise HTTPException(status_code=404, detail="Session not found")
    return insights


@app.get("/chart-data/{session_id}")
def get_chart_data(session_id: str, column: str, chart_type: str = "bar") -> ChartDataResponse:
    chart_data = processor.get_chart_data(session_id, column, chart_type)
    if not chart_data:
        raise HTTPException(status_code=400, detail="Invalid column or chart type")
    return chart_data


@app.get("/columns/{session_id}")
def get_columns(session_id: str) -> Dict[str, Any]:
    df = processor.get_data(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"columns": list(df.columns), "column_types": {col: str(dtype) for col, dtype in df.dtypes.items()}}


@app.get("/columns/{session_id}/types")
def get_column_types(session_id: str) -> Dict[str, List[str]]:
    df = processor.get_data(session_id)
    if df is None:
        raise HTTPException(status_code=404, detail="Session not found")

    dimensions = []
    metrics = []
    dates = []

    for col in df.columns:
        dtype = str(df[col].dtype)
        col_lower = col.lower()
        if 'date' in col_lower or 'time' in col_lower:
            dates.append(col)
        elif pd.api.types.is_numeric_dtype(df[col]):
            metrics.append(col)
        else:
            dimensions.append(col)

    return {"dimensions": dimensions, "metrics": metrics, "dates": dates}


@app.get("/aggregate/{session_id}")
def get_aggregate(session_id: str, dimension: str, metric: str = "", agg: str = "sum") -> Dict[str, Any]:
    result = processor.get_aggregated_data(session_id, dimension, metric, agg)
    if not result:
        raise HTTPException(status_code=400, detail="Invalid dimension or metric")
    return result


@app.get("/kpi/{session_id}")
def get_kpi(session_id: str) -> Dict[str, Any]:
    kpis = processor.get_kpi_data(session_id)
    if not kpis:
        raise HTTPException(status_code=404, detail="Session not found")
    return kpis


@app.get("/timeseries/{session_id}")
def get_time_series(session_id: str, dimension: str, metric: str, agg: str = "sum") -> Dict[str, Any]:
    result = processor.get_time_series(session_id, dimension, metric, agg)
    if not result:
        raise HTTPException(status_code=400, detail="No time series data available")
    return result


@app.get("/filter-options/{session_id}")
def get_filter_options(session_id: str) -> Dict[str, List[str]]:
    options = processor.get_filter_columns(session_id)
    if not options:
        raise HTTPException(status_code=404, detail="Session not found")
    return options