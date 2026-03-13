from fastapi import APIRouter
from services.data_loader import load_traffic_data
from services.traffic_analytics import calculate_overview, hourly_trend, junction_analysis
from services.prediction_model import predict_next_step

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
