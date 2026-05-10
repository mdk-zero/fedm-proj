from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum


class MissingValueMethod(str, Enum):
    DROP = "drop"
    MEAN = "mean"
    MEDIAN = "median"
    MODE = "mode"


class CleaningRequest(BaseModel):
    operation: str
    column: Optional[str] = None
    method: Optional[str] = None
    dtype: Optional[str] = None
    format: Optional[str] = None
    condition: Optional[Dict[str, Any]] = None


class ProfilingResponse(BaseModel):
    rows: int
    columns: int
    column_types: Dict[str, str]
    missing_values: Dict[str, int]
    basic_stats: Dict[str, Any]


class DataResponse(BaseModel):
    data: List[Dict[str, Any]]
    columns: List[str]
    profiling: ProfilingResponse


class ComparisonResponse(BaseModel):
    original_data: List[Dict[str, Any]]
    cleaned_data: List[Dict[str, Any]]
    changes: List[Dict[str, Any]]


class InsightsResponse(BaseModel):
    summary_stats: Dict[str, Any]
    frequent_values: Dict[str, List[tuple]]
    trends: Dict[str, Any]


class ChartDataResponse(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]