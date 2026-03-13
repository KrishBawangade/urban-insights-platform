from fastapi import APIRouter
from services.data_loader import load_traffic_data
from services.traffic_analytics import calculate_overview, hourly_trend, junction_analysis
from services.prediction_model import predict_next_step
from services.ai_insights import generate_ai_insight

router = APIRouter(prefix="/traffic", tags=["Traffic Analytics"])

@router.get("/overview")
def get_overview():
    df = load_traffic_data()
    return calculate_overview(df)

@router.get("/hourly-trend")
def get_hourly_trend():
    df = load_traffic_data()
    return hourly_trend(df)

@router.get("/junction-analysis")
def get_junction_analysis():
    df = load_traffic_data()
    return junction_analysis(df)

@router.get("/predict")
def get_prediction():
    df = load_traffic_data()
    preds = predict_next_step(df)
    return preds

@router.get("/ai-insights")
def get_ai_insights():
    df = load_traffic_data()
    overview = calculate_overview(df)
    trend = hourly_trend(df)
    predictions = predict_next_step(df)
    
    insight = generate_ai_insight(overview, trend, predictions)
    return {"recommendation": insight}
