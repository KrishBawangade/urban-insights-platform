from fastapi import APIRouter, Query

from services.transport_ai import generate_transport_ai_insight
from services.transport_prediction import predict_ridership
from services.transport_service import (
    calculate_transport_overview,
    get_agency_utilization,
    get_ridership_trend,
    get_weekly_ridership,
    load_transport_data,
)

router = APIRouter(prefix="/transport", tags=["Public Transport Analytics"])


@router.get("/overview")
def get_transport_overview():
    df = load_transport_data()
    return calculate_transport_overview(df)


@router.get("/ridership-trend")
def get_transport_ridership_trend():
    df = load_transport_data()
    return get_ridership_trend(df)


@router.get("/agency-utilization")
def get_transport_agency_utilization():
    df = load_transport_data()
    return get_agency_utilization(df)


@router.get("/weekly")
def get_transport_weekly_ridership():
    df = load_transport_data()
    return get_weekly_ridership(df)


@router.get("/predict")
def get_transport_prediction(days_ahead: int = Query(default=7, ge=1, le=30)):
    return predict_ridership(days_ahead=days_ahead)


@router.get("/ai-insight")
def get_transport_ai_insight():
    return {"insight": generate_transport_ai_insight()}
