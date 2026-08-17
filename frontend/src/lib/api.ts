const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000"
    : "";

// --- API Type Definitions ---

export interface GlobalMetrics {
  model: string;
  mae: number;
  rmse: number;
  r2: number;
  smape: number;
  retraining_events: number;
}

export interface MonthlyPerformance {
  month: number;
  month_name: string;
  mae: number;
  rmse: number;
  r2: number;
  smape: number;
}

export interface ModelComparison {
  model: string;
  mae: number;
  rmse: number;
  r2: number;
  smape: number;
  retraining_events: number;
  mae_improvement: number;
  rmse_improvement: number;
}

export interface DriftMonth {
  month: number;
  month_name: string;
  ks_statistic: number;
  p_value: number;
  drift_detected: boolean;
}

export interface DriftData {
  ks_threshold: number;
  p_value_threshold: number;
  months: DriftMonth[];
}

export interface PredictionRow {
  timestamp: string;
  actual: number;
  prediction: number;
  month: number;
}

export interface PredictionsData {
  model: string;
  rows: number;
  predictions: PredictionRow[];
}

export interface CorrelationInfo {
  correlation: number;
  p_value: number;
  statistically_significant: boolean;
}

export interface DriftErrorAnalysis {
  pearson: CorrelationInfo;
  spearman: CorrelationInfo;
  interpretation: string;
}

// --- API Fetch Functions ---

async function fetchJson<T>(endpoint: string): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from endpoint: ${url}`, error);
    throw new Error(`Failed to fetch from ${endpoint}. Please ensure backend is running.`);
  }
}

export async function checkBackendHealth(): Promise<{ status: string; service: string }> {
  return fetchJson<{ status: string; service: string }>("/api/health");
}

export async function getMetrics(): Promise<GlobalMetrics> {
  return fetchJson<GlobalMetrics>("/api/metrics");
}

export async function getMonthlyPerformance(): Promise<MonthlyPerformance[]> {
  return fetchJson<MonthlyPerformance[]>("/api/monthly-performance");
}

export async function getModelComparison(): Promise<ModelComparison[]> {
  return fetchJson<ModelComparison[]>("/api/model-comparison");
}

export async function getDriftData(): Promise<DriftData> {
  return fetchJson<DriftData>("/api/drift");
}

export async function getPredictions(): Promise<PredictionsData> {
  return fetchJson<PredictionsData>("/api/predictions");
}

export async function getDriftError(): Promise<DriftErrorAnalysis> {
  return fetchJson<DriftErrorAnalysis>("/api/drift-error");
}