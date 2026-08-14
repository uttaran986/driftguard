from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path

app = FastAPI(
    title="DriftGuard API",
    description="Adaptive Electricity Demand Forecasting and Drift Detection System",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "DriftGuard API is running",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "DriftGuard"
    }
# ============================================
# DRIFTGUARD MODEL METRICS
# ============================================

@app.get("/api/metrics")
def get_metrics():
    return {
        "model": "Adaptive DriftGuard V3",
        "mae": 3817.833026,
        "rmse": 5557.043995,
        "r2": 0.993392,
        "smape": 1.762840,
        "retraining_events": 7
    }
# ============================================
# MONTHLY PERFORMANCE
# ============================================

monthly_results = [
    {
        "month": 1,
        "month_name": "January",
        "mae": 3356.956172,
        "rmse": 5145.167071,
        "r2": 0.991590,
        "smape": 1.851374
    },
    {
        "month": 2,
        "month_name": "February",
        "mae": 2251.420049,
        "rmse": 2976.617171,
        "r2": 0.996786,
        "smape": 1.217478
    },
    {
        "month": 3,
        "month_name": "March",
        "mae": 2806.312367,
        "rmse": 5595.822617,
        "r2": 0.988410,
        "smape": 1.710027
    },
    {
        "month": 4,
        "month_name": "April",
        "mae": 3782.554950,
        "rmse": 4975.339161,
        "r2": 0.993069,
        "smape": 1.834046
    },
    {
        "month": 5,
        "month_name": "May",
        "mae": 4063.158384,
        "rmse": 5502.135354,
        "r2": 0.993926,
        "smape": 1.841532
    },
    {
        "month": 6,
        "month_name": "June",
        "mae": 4412.553676,
        "rmse": 6378.371414,
        "r2": 0.994244,
        "smape": 1.853518
    },
    {
        "month": 7,
        "month_name": "July",
        "mae": 4285.755912,
        "rmse": 5844.656115,
        "r2": 0.996449,
        "smape": 1.623934
    },
    {
        "month": 8,
        "month_name": "August",
        "mae": 4887.112114,
        "rmse": 6604.721464,
        "r2": 0.995949,
        "smape": 1.822604
    },
    {
        "month": 9,
        "month_name": "September",
        "mae": 4271.321480,
        "rmse": 5934.678307,
        "r2": 0.995810,
        "smape": 1.697097
    },
    {
        "month": 10,
        "month_name": "October",
        "mae": 4823.314123,
        "rmse": 8212.783732,
        "r2": 0.989023,
        "smape": 2.068068
    }
]


@app.get("/api/monthly-performance")
def get_monthly_performance():
    return monthly_results

# ============================================
# MODEL COMPARISON
# ============================================

model_comparison = [
    {
        "model": "Static Model",
        "mae": 3898.3948,
        "rmse": 5828.8307,
        "r2": 0.9947,
        "smape": 1.8000,
        "retraining_events": 0,
        "mae_improvement": 0.0000,
        "rmse_improvement": 0.0000
    },
    {
        "model": "Periodic Retraining",
        "mae": 3893.8152,
        "rmse": 5830.1407,
        "r2": 0.9947,
        "smape": 1.8017,
        "retraining_events": 4,
        "mae_improvement": 0.1175,
        "rmse_improvement": -0.0225
    },
    {
        "model": "One-Time DriftGuard",
        "mae": 3867.5332,
        "rmse": 5815.2680,
        "r2": 0.9947,
        "smape": 1.7874,
        "retraining_events": 1,
        "mae_improvement": 0.7916,
        "rmse_improvement": 0.2327
    },
    {
        "model": "Adaptive DriftGuard V3",
        "mae": 3817.8330,
        "rmse": 5557.0440,
        "r2": 0.9934,
        "smape": 1.7628,
        "retraining_events": 7,
        "mae_improvement": 2.0665,
        "rmse_improvement": 4.6628
    }
]


@app.get("/api/model-comparison")
def get_model_comparison():
    return model_comparison

# ============================================
# DRIFT DETECTION
# ============================================

drift_results = [
    {
        "month": 1,
        "month_name": "January",
        "ks_statistic": 0.110999,
        "p_value": 2.730155e-07,
        "drift_detected": True
    },
    {
        "month": 2,
        "month_name": "February",
        "ks_statistic": 0.107815,
        "p_value": 4.910695e-04,
        "drift_detected": True
    },
    {
        "month": 3,
        "month_name": "March",
        "ks_statistic": 0.096150,
        "p_value": 2.674485e-03,
        "drift_detected": False
    },
    {
        "month": 4,
        "month_name": "April",
        "ks_statistic": 0.137724,
        "p_value": 1.598231e-06,
        "drift_detected": True
    },
    {
        "month": 5,
        "month_name": "May",
        "ks_statistic": 0.088620,
        "p_value": 5.871714e-03,
        "drift_detected": False
    },
    {
        "month": 6,
        "month_name": "June",
        "ks_statistic": 0.103987,
        "p_value": 6.603062e-04,
        "drift_detected": True
    },
    {
        "month": 7,
        "month_name": "July",
        "ks_statistic": 0.148925,
        "p_value": 1.487425e-07,
        "drift_detected": True
    },
    {
        "month": 8,
        "month_name": "August",
        "ks_statistic": 0.091398,
        "p_value": 3.980308e-03,
        "drift_detected": False
    },
    {
        "month": 9,
        "month_name": "September",
        "ks_statistic": 0.053360,
        "p_value": 2.369458e-01,
        "drift_detected": False
    },
    {
        "month": 10,
        "month_name": "October",
        "ks_statistic": 0.064740,
        "p_value": 8.780879e-02,
        "drift_detected": False
    }
]


@app.get("/api/drift")
def get_drift():
    return {
        "ks_threshold": 0.1,
        "p_value_threshold": 0.05,
        "months": drift_results
    }
# ============================================
# PREDICTIONS
# ============================================

PREDICTIONS_FILE = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "v3_predictions.json"
)


@app.get("/api/predictions")
def get_predictions():

    if not PREDICTIONS_FILE.exists():
        return {
            "error": "V3 prediction file not found",
            "file": str(PREDICTIONS_FILE)
        }

    with open(PREDICTIONS_FILE, "r", encoding="utf-8") as file:
        predictions = json.load(file)

    return {
        "model": "Adaptive DriftGuard V3",
        "rows": len(predictions),
        "predictions": predictions
    }

# ============================================
# DRIFT VS ERROR ANALYSIS
# ============================================

drift_error_analysis = {
    "pearson": {
        "correlation": -0.4848,
        "p_value": 0.1102,
        "statistically_significant": False
    },
    "spearman": {
        "correlation": -0.5524,
        "p_value": 0.0625,
        "statistically_significant": False
    },
    "interpretation": (
        "Neither Pearson nor Spearman correlation between "
        "drift and forecast error is statistically significant."
    )
}


@app.get("/api/drift-error")
def get_drift_error():
    return drift_error_analysis