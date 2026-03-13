from __future__ import annotations

import os
from typing import Any

from dotenv import load_dotenv

from services.cache_utils import cache
from services.transport_service import (
    calculate_transport_overview,
    get_agency_utilization,
    load_transport_data,
)

load_dotenv()
TRANSPORT_AI_CACHE_TTL_SECONDS = 900


def generate_transport_ai_insight() -> str:
    def build_insight() -> str:
        df = load_transport_data()
        if df.empty:
            return "Public transport data is unavailable. Verify the transit dataset before generating planning insights."

        overview = calculate_transport_overview(df)
        agencies = get_agency_utilization(df)
        top_agency = agencies[0]["agency"] if agencies else "Unknown"

        growth_percent = float(overview["ridership_growth_percent"])
        if growth_percent > 1:
            trend_direction = "upward"
        elif growth_percent < -1:
            trend_direction = "downward"
        else:
            trend_direction = "stable"

        weekday_average = (
            df[df["date"].dt.weekday < 5]["current_ridership"].mean() if not df.empty else 0.0
        )
        weekend_average = (
            df[df["date"].dt.weekday >= 5]["current_ridership"].mean() if not df.empty else 0.0
        )

        fallback_message = (
            f"Ridership demand is highest for {top_agency}. Recent system demand is {trend_direction}, "
            f"with weekday average ridership at {weekday_average:.0f} versus weekend ridership at {weekend_average:.0f}. "
            "Transit planners should align service frequency and staffing to the strongest weekday corridors."
        )

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return fallback_message

        try:
            from google import genai

            client = genai.Client(api_key=api_key)
            prompt = _build_transport_prompt(
                overview=overview,
                top_agency=top_agency,
                trend_direction=trend_direction,
                weekday_average=weekday_average,
                weekend_average=weekend_average,
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.text.strip() if response.text else fallback_message
        except Exception as exc:
            print(f"Error calling Gemini API for transport insight: {exc}")
            return fallback_message

    return cache.get_or_set("transport:ai-insight", TRANSPORT_AI_CACHE_TTL_SECONDS, build_insight)


def _build_transport_prompt(
    *,
    overview: dict[str, Any],
    top_agency: str,
    trend_direction: str,
    weekday_average: float,
    weekend_average: float,
) -> str:
    return f"""
You are an AI transit operations analyst for a Smart City dashboard.

Transit overview:
- Total ridership: {overview.get("total_ridership")}
- Active agencies: {overview.get("active_agencies")}
- Average daily ridership: {overview.get("average_daily_ridership")}
- Last 7-day growth: {overview.get("ridership_growth_percent")}%
- Top agency by ridership: {top_agency}
- Trend direction: {trend_direction}
- Average weekday ridership: {weekday_average:.0f}
- Average weekend ridership: {weekend_average:.0f}

Task:
Write 2 to 3 concise sentences for city transit planners. Mention the top agency, whether demand is rising or falling,
and one actionable recommendation about service frequency, staffing, or resource allocation. Do not use markdown or bullets.
""".strip()
