from fastapi import APIRouter

from services.weather_service import get_air_quality_data, get_air_quality_forecast, get_weather_data

router = APIRouter(prefix="/air-quality", tags=["Air Quality"])


@router.get("/weather")
def get_live_weather(lat: float | None = None, lon: float | None = None):
    return get_weather_data(lat=lat, lon=lon)


@router.get("/current")
def get_current_air_quality(lat: float | None = None, lon: float | None = None):
    return get_air_quality_data(lat=lat, lon=lon)


@router.get("/forecast")
def get_forecast_air_quality(lat: float | None = None, lon: float | None = None, hours: int = 8):
    return get_air_quality_forecast(lat=lat, lon=lon, hours=hours)
