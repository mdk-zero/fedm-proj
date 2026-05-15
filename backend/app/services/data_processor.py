import pandas as pd
import numpy as np
import uuid
from typing import Dict, Any, List, Optional
import io


class DataProcessor:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, pd.DataFrame]] = {}

    def create_session(self, df: pd.DataFrame) -> str:
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "original": df.copy(),
            "current": df.copy()
        }
        return session_id

    def get_data(self, session_id: str) -> Optional[pd.DataFrame]:
        if session_id not in self.sessions:
            return None
        return self.sessions[session_id]["current"]

    def get_original(self, session_id: str) -> Optional[pd.DataFrame]:
        if session_id not in self.sessions:
            return None
        return self.sessions[session_id]["original"]

    def profile_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        column_types = {col: str(dtype) for col, dtype in df.dtypes.items()}

        missing_values = {}
        for col in df.columns:
            missing_count = df[col].isna().sum()
            if missing_count > 0:
                missing_values[col] = int(missing_count)

        basic_stats = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            basic_stats[col] = {
                "mean": float(df[col].mean()) if not df[col].isna().all() else None,
                "median": float(df[col].median()) if not df[col].isna().all() else None,
                "min": float(df[col].min()) if not df[col].isna().all() else None,
                "max": float(df[col].max()) if not df[col].isna().all() else None,
                "std": float(df[col].std()) if not df[col].isna().all() else None
            }

        return {
            "rows": len(df),
            "columns": len(df.columns),
            "column_types": column_types,
            "missing_values": missing_values,
            "basic_stats": basic_stats
        }

    def handle_missing(self, session_id: str, column: Optional[str] = None, method: str = "drop") -> bool:
        df = self.get_data(session_id)
        if df is None:
            return False

        if column:
            if method == "drop":
                df = df.dropna(subset=[column])
            elif method == "mean" and pd.api.types.is_numeric_dtype(df[column]):
                df[column] = df[column].fillna(df[column].mean())
            elif method == "median" and pd.api.types.is_numeric_dtype(df[column]):
                df[column] = df[column].fillna(df[column].median())
            elif method == "mode":
                mode_val = df[column].mode()
                if len(mode_val) > 0:
                    df[column] = df[column].fillna(mode_val[0])
        else:
            if method == "drop":
                df = df.dropna()
            elif method == "drop_columns":
                df = df.dropna(axis=1)

        self.sessions[session_id]["current"] = df
        return True

    def remove_duplicates(self, session_id: str) -> int:
        df = self.get_data(session_id)
        if df is None:
            return 0

        before = len(df)
        df = df.drop_duplicates()
        after = len(df)
        self.sessions[session_id]["current"] = df
        return before - after

    def convert_dtype(self, session_id: str, column: str, dtype: str) -> bool:
        df = self.get_data(session_id)
        if df is None or column not in df.columns:
            return False

        try:
            if dtype == "numeric":
                df[column] = pd.to_numeric(df[column], errors="coerce")
            elif dtype == "datetime":
                df[column] = pd.to_datetime(df[column], errors="coerce")
            elif dtype == "string":
                df[column] = df[column].astype(str)
            elif dtype == "category":
                df[column] = df[column].astype("category")
            self.sessions[session_id]["current"] = df
            return True
        except Exception:
            return False

    def filter_invalid(self, session_id: str, column: str, condition: Dict[str, Any]) -> int:
        df = self.get_data(session_id)
        if df is None or column not in df.columns:
            return 0

        before = len(df)
        op = condition.get("operator")
        value = condition.get("value")

        if op == "==":
            df = df[df[column] == value]
        elif op == "!=":
            df = df[df[column] != value]
        elif op == ">":
            df = df[df[column] > value]
        elif op == "<":
            df = df[df[column] < value]
        elif op == ">=":
            df = df[df[column] >= value]
        elif op == "<=":
            df = df[df[column] <= value]
        elif op == "isna":
            df = df[df[column].isna()]
        elif op == "notna":
            df = df[df[column].notna()]

        self.sessions[session_id]["current"] = df
        return before - len(df)

    def get_comparison(self, session_id: str) -> Dict[str, Any]:
        original = self.get_original(session_id)
        current = self.get_data(session_id)

        if original is None or current is None:
            return {}

        changes = []
        if len(original) != len(current):
            changes.append({
                "type": "rows",
                "description": f"Row count changed from {len(original)} to {len(current)}"
            })

        for col in original.columns:
            if col not in current.columns:
                changes.append({
                    "type": "column_removed",
                    "description": f"Column '{col}' was removed"
                })

        missing_orig = original.isna().sum().sum()
        missing_curr = current.isna().sum().sum()
        if missing_orig != missing_curr:
            changes.append({
                "type": "missing_values",
                "description": f"Missing values changed from {missing_orig} to {missing_curr}"
            })

        return {
            "original_data": original.to_dict("records"),
            "cleaned_data": current.to_dict("records"),
            "changes": changes
        }

    def get_insights(self, session_id: str) -> Dict[str, Any]:
        df = self.get_data(session_id)
        if df is None:
            return {}

        summary_stats = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            summary_stats[col] = {
                "count": int(df[col].count()),
                "mean": round(float(df[col].mean()), 2) if not df[col].isna().all() else None,
                "std": round(float(df[col].std()), 2) if not df[col].isna().all() else None,
                "min": round(float(df[col].min()), 2) if not df[col].isna().all() else None,
                "max": round(float(df[col].max()), 2) if not df[col].isna().all() else None
            }

        frequent_values = {}
        for col in df.columns:
            value_counts = df[col].value_counts().head(5)
            frequent_values[col] = [(str(k), int(v)) for k, v in value_counts.items()]

        trends = {}
        for col in numeric_cols[:5]:
            if len(df[col]) > 1:
                diff = df[col].diff().mean()
                trends[col] = "increasing" if diff > 0 else "decreasing" if diff < 0 else "stable"

        return {
            "summary_stats": summary_stats,
            "frequent_values": frequent_values,
            "trends": trends
        }

    def get_chart_data(self, session_id: str, column: str, chart_type: str = "bar") -> Dict[str, Any]:
        df = self.get_data(session_id)
        if df is None or column not in df.columns:
            return {}

        if chart_type in ["bar", "pie"]:
            value_counts = df[column].value_counts().head(10)
            labels = [str(x) for x in value_counts.index]
            values = [int(x) for x in value_counts.values]
            return {
                "labels": labels,
                "datasets": [{
                    "label": column,
                    "data": values,
                    "backgroundColor": [
                        "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
                        "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
                    ]
                }]
            }
        elif chart_type == "line":
            if not pd.api.types.is_numeric_dtype(df[column]):
                value_counts = df[column].value_counts().head(20)
                labels = [str(x) for x in value_counts.index]
                values = [int(x) for x in value_counts.values]
            else:
                df_sorted = df.sort_index()
                labels = [str(i) for i in range(len(df_sorted))]
                values = [None if pd.isna(x) else float(x) for x in df_sorted[column]]
            return {
                "labels": labels,
                "datasets": [{
                    "label": column,
                    "data": values,
                    "borderColor": "#3B82F6",
                    "backgroundColor": "rgba(59, 130, 246, 0.1)"
                }]
            }

        return {}

    def get_aggregated_data(self, session_id: str, dimension: str, metric: str, agg_func: str = "sum") -> Dict[str, Any]:
        df = self.get_data(session_id)
        if df is None or dimension not in df.columns:
            return {}

        if metric and metric in df.columns:
            if agg_func == "sum":
                grouped = df.groupby(dimension)[metric].sum()
            elif agg_func == "avg":
                grouped = df.groupby(dimension)[metric].mean()
            elif agg_func == "count":
                grouped = df.groupby(dimension)[metric].count()
            elif agg_func == "min":
                grouped = df.groupby(dimension)[metric].min()
            elif agg_func == "max":
                grouped = df.groupby(dimension)[metric].max()
        else:
            grouped = df[dimension].value_counts()

        labels = [str(x) for x in grouped.index]
        values = [round(float(x), 2) for x in grouped.values]

        return {
            "labels": labels,
            "values": values,
            "dimension": dimension,
            "metric": metric,
            "aggregation": agg_func
        }

    def get_kpi_data(self, session_id: str) -> Dict[str, Any]:
        df = self.get_data(session_id)
        if df is None:
            return {}

        kpis = {"total_rows": len(df)}

        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            kpis[f"{col}_sum"] = round(float(df[col].sum()), 2)
            kpis[f"{col}_avg"] = round(float(df[col].mean()), 2)
            kpis[f"{col}_max"] = round(float(df[col].max()), 2)

        return kpis

    def get_time_series(self, session_id: str, dimension: str, metric: str, agg_func: str = "sum") -> Dict[str, Any]:
        df = self.get_data(session_id)
        if df is None:
            return {}

        date_cols = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        if not date_cols:
            return self.get_aggregated_data(session_id, dimension, metric, agg_func)

        date_col = date_cols[0]
        try:
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            df = df.dropna(subset=[date_col])
            df = df.sort_values(date_col)

            if agg_func == "sum":
                grouped = df.groupby(df[date_col].dt.strftime('%Y-%m-%d'))[metric].sum()
            elif agg_func == "avg":
                grouped = df.groupby(df[date_col].dt.strftime('%Y-%m-%d'))[metric].mean()
            elif agg_func == "count":
                grouped = df.groupby(df[date_col].dt.strftime('%Y-%m-%d'))[metric].count()
            else:
                grouped = df.groupby(df[date_col].dt.strftime('%Y-%m-%d'))[metric].sum()

            return {
                "labels": [str(x) for x in grouped.index],
                "values": [round(float(x), 2) for x in grouped.values],
                "dimension": dimension,
                "metric": metric
            }
        except Exception:
            return self.get_aggregated_data(session_id, dimension, metric, agg_func)

    def get_filter_columns(self, session_id: str) -> Dict[str, List[str]]:
        df = self.get_data(session_id)
        if df is None:
            return {}

        filter_cols = {}
        for col in df.columns:
            if df[col].dtype == 'object' or df[col].dtype.name == 'category':
                unique_vals = df[col].dropna().unique().tolist()[:50]
                filter_cols[col] = [str(v) for v in unique_vals]

        return filter_cols


processor = DataProcessor()


def load_data(file_content: bytes, filename: str) -> pd.DataFrame:
    if filename.endswith(".csv"):
        return pd.read_csv(io.BytesIO(file_content))
    elif filename.endswith((".xlsx", ".xls")):
        return pd.read_excel(io.BytesIO(file_content))
    else:
        raise ValueError("Unsupported file format")