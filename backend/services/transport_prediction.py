from __future__ import annotations

from datetime import timedelta

import pandas as pd
from sklearn.linear_model import LinearRegression

from services.cache_utils import cache
from services.transport_service import load_transport_data

TRANSPORT_PREDICTION_CACHE_TTL_SECONDS = 900


def predict_ridership(days_ahead: int = 7) -> list[dict[str, str | int]]:
    cache_key = f"transport:predict:{days_ahead}"

    def build_prediction() -> list[dict[str, str | int]]:
        df = load_transport_data()
        if df.empty or days_ahead <= 0:
            return []

        daily_ridership = df.groupby("date_only", as_index=False)["current_ridership"].sum().sort_values("date_only")
        if daily_ridership.empty:
            return []

        training_frame = daily_ridership.copy()
        training_frame["ordinal_date"] = training_frame["date_only"].map(pd.Timestamp.toordinal)

        model = LinearRegression()
        model.fit(training_frame[["ordinal_date"]], training_frame["current_ridership"])

        last_date = training_frame["date_only"].max()
        future_dates = [last_date + timedelta(days=day) for day in range(1, days_ahead + 1)]
        future_frame = pd.DataFrame({"date_only": future_dates})
        future_frame["ordinal_date"] = future_frame["date_only"].map(pd.Timestamp.toordinal)
        future_frame["predicted_ridership"] = model.predict(future_frame[["ordinal_date"]]).round()

        return [
            {
                "date": row["date_only"].strftime("%Y-%m-%d"),
                "predicted_ridership": max(0, int(row["predicted_ridership"])),
            }
            for _, row in future_frame.iterrows()
        ]

    return cache.get_or_set(cache_key, TRANSPORT_PREDICTION_CACHE_TTL_SECONDS, build_prediction)
