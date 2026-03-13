import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

OPENWEATHER_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
OPENWEATHER_AIR_POLLUTION_URL = "https://api.openweathermap.org/data/2.5/air_pollution"
OPENWEATHER_AIR_POLLUTION_FORECAST_URL = "https://api.openweathermap.org/data/2.5/air_pollution/forecast"

AQI_LABELS = [
    (0, 50, "Good"),
    (51, 100, "Moderate"),
    (101, 150, "Unhealthy for Sensitive"),
    (151, 200, "Unhealthy"),
    (201, 300, "Very Unhealthy"),
    (301, 500, "Hazardous"),
]

SAFE_LIMITS = {
    "PM2.5": 10,
    "PM10": 20,
    "O3": 60,
    "NO2": 40,
    "SO2": 20,
}

AQI_BREAKPOINTS = {
    "pm2_5": [
        {"c_low": 0.0, "c_high": 12.0, "i_low": 0, "i_high": 50},
        {"c_low": 12.1, "c_high": 35.4, "i_low": 51, "i_high": 100},
        {"c_low": 35.5, "c_high": 55.4, "i_low": 101, "i_high": 150},
        {"c_low": 55.5, "c_high": 150.4, "i_low": 151, "i_high": 200},
        {"c_low": 150.5, "c_high": 250.4, "i_low": 201, "i_high": 300},
        {"c_low": 250.5, "c_high": 500.4, "i_low": 301, "i_high": 500},
    ],
    "pm10": [
        {"c_low": 0.0, "c_high": 54.0, "i_low": 0, "i_high": 50},
        {"c_low": 55.0, "c_high": 154.0, "i_low": 51, "i_high": 100},
        {"c_low": 155.0, "c_high": 254.0, "i_low": 101, "i_high": 150},
        {"c_low": 255.0, "c_high": 354.0, "i_low": 151, "i_high": 200},
        {"c_low": 355.0, "c_high": 424.0, "i_low": 201, "i_high": 300},
        {"c_low": 425.0, "c_high": 604.0, "i_low": 301, "i_high": 500},
    ],
    "o3": [
        {"c_low": 0.0, "c_high": 54.0, "i_low": 0, "i_high": 50},
        {"c_low": 55.0, "c_high": 70.0, "i_low": 51, "i_high": 100},
        {"c_low": 71.0, "c_high": 85.0, "i_low": 101, "i_high": 150},
        {"c_low": 86.0, "c_high": 105.0, "i_low": 151, "i_high": 200},
        {"c_low": 106.0, "c_high": 200.0, "i_low": 201, "i_high": 300},
    ],
    "no2": [
        {"c_low": 0.0, "c_high": 53.0, "i_low": 0, "i_high": 50},
        {"c_low": 54.0, "c_high": 100.0, "i_low": 51, "i_high": 100},
        {"c_low": 101.0, "c_high": 360.0, "i_low": 101, "i_high": 150},
        {"c_low": 361.0, "c_high": 649.0, "i_low": 151, "i_high": 200},
        {"c_low": 650.0, "c_high": 1249.0, "i_low": 201, "i_high": 300},
        {"c_low": 1250.0, "c_high": 2049.0, "i_low": 301, "i_high": 500},
    ],
    "so2": [
        {"c_low": 0.0, "c_high": 35.0, "i_low": 0, "i_high": 50},
        {"c_low": 36.0, "c_high": 75.0, "i_low": 51, "i_high": 100},
        {"c_low": 76.0, "c_high": 185.0, "i_low": 101, "i_high": 150},
        {"c_low": 186.0, "c_high": 304.0, "i_low": 151, "i_high": 200},
        {"c_low": 305.0, "c_high": 604.0, "i_low": 201, "i_high": 300},
        {"c_low": 605.0, "c_high": 1004.0, "i_low": 301, "i_high": 500},
    ],
    "co": [
        {"c_low": 0.0, "c_high": 4.4, "i_low": 0, "i_high": 50},
        {"c_low": 4.5, "c_high": 9.4, "i_low": 51, "i_high": 100},
        {"c_low": 9.5, "c_high": 12.4, "i_low": 101, "i_high": 150},
        {"c_low": 12.5, "c_high": 15.4, "i_low": 151, "i_high": 200},
        {"c_low": 15.5, "c_high": 30.4, "i_low": 201, "i_high": 300},
        {"c_low": 30.5, "c_high": 50.4, "i_low": 301, "i_high": 500},
    ],
}

MOLECULAR_WEIGHTS = {
    "o3": 48.0,
    "no2": 46.0055,
    "so2": 64.066,
}


def get_request_coordinates(lat=None, lon=None):
    default_lat = os.getenv("OPENWEATHER_LAT", "21.1458")
    default_lon = os.getenv("OPENWEATHER_LON", "79.0882")
    return str(lat if lat is not None else default_lat), str(lon if lon is not None else default_lon)


def get_aqi_label(aqi_value):
    for low, high, label in AQI_LABELS:
        if low <= aqi_value <= high:
            return label
    return "Hazardous" if aqi_value > 500 else "Unknown"


def calculate_sub_index(concentration, breakpoints):
    capped_value = max(0.0, concentration)

    for bp in breakpoints:
        if bp["c_low"] <= capped_value <= bp["c_high"]:
            return ((bp["i_high"] - bp["i_low"]) / (bp["c_high"] - bp["c_low"])) * (
                capped_value - bp["c_low"]
            ) + bp["i_low"]

    highest = breakpoints[-1]
    if capped_value > highest["c_high"]:
        return highest["i_high"]

    return 0.0


def convert_ugm3_to_ppb(value, pollutant):
    return value * 24.45 / MOLECULAR_WEIGHTS[pollutant]


def convert_ugm3_to_ppm(value):
    return value / 1145.0


def calculate_aqi_from_components(components):
    pollutant_values = {
        "pm2_5": float(components.get("pm2_5", 0.0)),
        "pm10": float(components.get("pm10", 0.0)),
        "o3": convert_ugm3_to_ppb(float(components.get("o3", 0.0)), "o3"),
        "no2": convert_ugm3_to_ppb(float(components.get("no2", 0.0)), "no2"),
        "so2": convert_ugm3_to_ppb(float(components.get("so2", 0.0)), "so2"),
        "co": convert_ugm3_to_ppm(float(components.get("co", 0.0))),
    }

    sub_indices = {
        pollutant: round(calculate_sub_index(value, AQI_BREAKPOINTS[pollutant]))
        for pollutant, value in pollutant_values.items()
    }
    dominant_pollutant, dominant_index = max(sub_indices.items(), key=lambda item: item[1])

    return {
        "aqi": int(dominant_index),
        "aqi_label": get_aqi_label(int(dominant_index)),
        "dominant_pollutant": dominant_pollutant,
        "sub_indices": sub_indices,
    }


def call_openweather(url, *, lat=None, lon=None, extra_params=None):
    api_key = os.getenv("OPENWEATHER_API_KEY")
    request_lat, request_lon = get_request_coordinates(lat=lat, lon=lon)

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENWEATHER_API_KEY is not configured on the backend.",
        )

    query_params = {
        "lat": request_lat,
        "lon": request_lon,
        "appid": api_key,
    }

    if extra_params:
        query_params.update(extra_params)

    query = urlencode(query_params)

    try:
        with urlopen(f"{url}?{query}", timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")
        raise HTTPException(
            status_code=exc.code,
            detail=f"OpenWeather request failed: {detail or exc.reason}",
        ) from exc
    except URLError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to reach OpenWeather: {exc.reason}",
        ) from exc

    return payload, request_lat, request_lon


def get_weather_data(lat=None, lon=None):
    payload, request_lat, request_lon = call_openweather(
        OPENWEATHER_WEATHER_URL,
        lat=lat,
        lon=lon,
        extra_params={"units": "metric"},
    )
    main_data = payload.get("main", {})

    if "temp" not in main_data or "humidity" not in main_data:
        raise HTTPException(
            status_code=502,
            detail="OpenWeather response is missing temperature or humidity fields.",
        )

    return {
        "city": payload.get("name", "Unknown"),
        "lat": request_lat,
        "lon": request_lon,
        "temperature": main_data["temp"],
        "humidity": main_data["humidity"],
        "source": "OpenWeather Live Data",
    }


def get_air_quality_data(lat=None, lon=None):
    payload, request_lat, request_lon = call_openweather(
        OPENWEATHER_AIR_POLLUTION_URL,
        lat=lat,
        lon=lon,
    )
    records = payload.get("list", [])

    if not records:
        raise HTTPException(
            status_code=502,
            detail="OpenWeather air pollution response is missing data.",
        )

    current = records[0]
    components = current.get("components", {})
    calculated_aqi = calculate_aqi_from_components(components)

    return {
        "lat": request_lat,
        "lon": request_lon,
        "aqi": calculated_aqi["aqi"],
        "aqi_label": calculated_aqi["aqi_label"],
        "dominant_pollutant": calculated_aqi["dominant_pollutant"],
        "sub_indices": calculated_aqi["sub_indices"],
        "components": components,
        "pollutant_breakdown": [
            {"name": "PM2.5", "value": components.get("pm2_5", 0), "threshold": SAFE_LIMITS["PM2.5"]},
            {"name": "PM10", "value": components.get("pm10", 0), "threshold": SAFE_LIMITS["PM10"]},
            {"name": "O3", "value": components.get("o3", 0), "threshold": SAFE_LIMITS["O3"]},
            {"name": "NO2", "value": components.get("no2", 0), "threshold": SAFE_LIMITS["NO2"]},
            {"name": "SO2", "value": components.get("so2", 0), "threshold": SAFE_LIMITS["SO2"]},
        ],
        "source": "OpenWeather Air Pollution API with EPA-style AQI interpolation",
    }


def get_air_quality_forecast(lat=None, lon=None, hours=8):
    payload, request_lat, request_lon = call_openweather(
        OPENWEATHER_AIR_POLLUTION_FORECAST_URL,
        lat=lat,
        lon=lon,
    )
    records = payload.get("list", [])

    if not records:
        raise HTTPException(
            status_code=502,
            detail="OpenWeather air pollution forecast response is missing data.",
        )

    trend = []
    for item in records[:hours]:
        components = item.get("components", {})
        calculated_aqi = calculate_aqi_from_components(components)
        trend.append({
            "time": item.get("dt"),
            "aqi": calculated_aqi["aqi"],
            "aqi_label": calculated_aqi["aqi_label"],
            "dominant_pollutant": calculated_aqi["dominant_pollutant"],
            "pm25": components.get("pm2_5", 0),
            "pm10": components.get("pm10", 0),
            "no2": components.get("no2", 0),
        })

    return {
        "lat": request_lat,
        "lon": request_lon,
        "forecast": trend,
        "source": "OpenWeather Air Pollution API with EPA-style AQI interpolation",
    }
