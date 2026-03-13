from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


_transport_df: pd.DataFrame | None = None

DATASET_DIR = Path(__file__).resolve().parent.parent / "datasets"
CSV_DATASET_PATH = DATASET_DIR / "public_transit.csv"
JSON_DATASET_PATH = DATASET_DIR / "public_transit.json"
TARGET_AVERAGE_DAILY_RIDERSHIP = 185000
NAGPUR_AGENCY_CONFIG = {
    "New York City MTA Rail": {
        "agency": "Nagpur Metro Rail",
        "mode": "Metro",
        "share": 0.34,
    },
    "WMATA Bus and Rail": {
        "agency": "Aapli Bus + Metro Feeder",
        "mode": "Bus + Feeder",
        "share": 0.58,
    },
    "San Francisco BART Rail": {
        "agency": "MIHAN Shuttle Rail Link",
        "mode": "Shuttle Rail",
        "share": 0.08,
    },
}


def _load_transport_from_csv(dataset_path: Path) -> pd.DataFrame:
    df = pd.read_csv(dataset_path)
    expected_columns = {"agency", "mode", "date", "week_number", "current_ridership", "year"}

    if not expected_columns.issubset(df.columns):
        missing_columns = expected_columns.difference(df.columns)
        raise ValueError(f"public_transit.csv is missing required columns: {sorted(missing_columns)}")

    return df.loc[:, ["agency", "mode", "date", "week_number", "current_ridership", "year"]].copy()


def _load_transport_from_json(dataset_path: Path) -> pd.DataFrame:
    with dataset_path.open(encoding="utf-8") as file:
        payload = json.load(file)

    rows = payload.get("data", [])
    if not rows:
        return pd.DataFrame(columns=["agency", "mode", "date", "week_number", "current_ridership", "year"])

    normalized_rows = [
        {
            "agency": row[8],
            "mode": row[9],
            "date": row[10],
            "week_number": row[11],
            "current_ridership": row[12],
            "year": row[13],
        }
        for row in rows
    ]
    return pd.DataFrame(normalized_rows)


def _normalize_transport_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    normalized_df = df.copy()
    normalized_df["date"] = pd.to_datetime(normalized_df["date"], errors="coerce")
    normalized_df["week_number"] = pd.to_numeric(normalized_df["week_number"], errors="coerce")
    normalized_df["current_ridership"] = pd.to_numeric(normalized_df["current_ridership"], errors="coerce")
    normalized_df["year"] = pd.to_numeric(normalized_df["year"], errors="coerce")

    normalized_df = normalized_df.dropna(subset=["agency", "date", "current_ridership"]).copy()
    normalized_df["agency"] = normalized_df["agency"].astype(str).str.strip()
    normalized_df["mode"] = normalized_df["mode"].fillna("Unknown").astype(str).str.strip()
    normalized_df["week_number"] = normalized_df["week_number"].fillna(normalized_df["date"].dt.isocalendar().week)
    normalized_df["year"] = normalized_df["year"].fillna(normalized_df["date"].dt.year)
    normalized_df["hour"] = normalized_df["date"].dt.hour
    normalized_df["weekday"] = normalized_df["date"].dt.day_name()
    normalized_df["month"] = normalized_df["date"].dt.month
    normalized_df["date_only"] = normalized_df["date"].dt.normalize()

    return normalized_df.sort_values("date").reset_index(drop=True)


def _apply_nagpur_scenario(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df

    nagpur_df = df.copy()
    unique_days = nagpur_df["date_only"].nunique()
    if unique_days == 0:
        return nagpur_df

    nagpur_df["agency"] = nagpur_df["agency"].map(
        lambda agency: NAGPUR_AGENCY_CONFIG.get(agency, {}).get("agency", agency)
    )
    nagpur_df["mode"] = nagpur_df["agency"].map(
        {
            config["agency"]: config["mode"]
            for config in NAGPUR_AGENCY_CONFIG.values()
        }
    ).fillna(nagpur_df["mode"])

    original_dates = sorted(nagpur_df["date_only"].dropna().unique())
    shifted_dates = pd.date_range(
        end=pd.Timestamp.now().normalize(),
        periods=len(original_dates),
        freq="D",
    )
    date_mapping = {
        pd.Timestamp(original_date): shifted_date
        for original_date, shifted_date in zip(original_dates, shifted_dates)
    }
    nagpur_df["date_only"] = nagpur_df["date_only"].map(date_mapping)
    nagpur_df["date"] = nagpur_df["date_only"]
    nagpur_df["year"] = nagpur_df["date"].dt.year
    nagpur_df["week_number"] = nagpur_df["date"].dt.isocalendar().week.astype(int)
    nagpur_df["hour"] = nagpur_df["date"].dt.hour
    nagpur_df["weekday"] = nagpur_df["date"].dt.day_name()
    nagpur_df["month"] = nagpur_df["date"].dt.month

    weekday_multiplier = {
        "Monday": 1.08,
        "Tuesday": 1.1,
        "Wednesday": 1.09,
        "Thursday": 1.07,
        "Friday": 1.03,
        "Saturday": 0.87,
        "Sunday": 0.76,
    }
    agency_shares = {
        config["agency"]: float(config["share"])
        for config in NAGPUR_AGENCY_CONFIG.values()
    }
    sorted_dates = sorted(nagpur_df["date_only"].dropna().unique())
    day_index_map = {
        pd.Timestamp(date_value): index
        for index, date_value in enumerate(sorted_dates)
    }
    max_index = max(len(sorted_dates) - 1, 1)

    synthetic_daily_totals: dict[pd.Timestamp, int] = {}
    for date_value in sorted_dates:
        timestamp = pd.Timestamp(date_value)
        trend_factor = 0.97 + (day_index_map[timestamp] / max_index) * 0.08
        synthetic_total = TARGET_AVERAGE_DAILY_RIDERSHIP * weekday_multiplier[timestamp.day_name()] * trend_factor
        synthetic_daily_totals[timestamp] = int(round(synthetic_total))

    def assign_synthetic_ridership(group: pd.DataFrame) -> pd.DataFrame:
        date_value = pd.Timestamp(group.name)
        target_total = synthetic_daily_totals[date_value]
        present_agencies = group["agency"].tolist()
        present_share_total = sum(agency_shares.get(agency, 0.0) for agency in present_agencies) or 1.0

        group = group.copy()
        allocated = []
        for row_index, agency in enumerate(present_agencies):
            normalized_share = agency_shares.get(agency, 0.0) / present_share_total
            ridership = int(round(target_total * normalized_share))
            allocated.append(ridership)

        difference = target_total - sum(allocated)
        if allocated:
            allocated[0] += difference

        group["current_ridership"] = allocated
        return group

    nagpur_df = nagpur_df.groupby("date_only", group_keys=False).apply(assign_synthetic_ridership)
    nagpur_df["date_only"] = nagpur_df["date"].dt.normalize()

    return nagpur_df.sort_values("date").reset_index(drop=True)


def load_transport_data() -> pd.DataFrame:
    global _transport_df

    if _transport_df is not None:
        return _transport_df

    try:
        if CSV_DATASET_PATH.exists():
            raw_df = _load_transport_from_csv(CSV_DATASET_PATH)
        elif JSON_DATASET_PATH.exists():
            raw_df = _load_transport_from_json(JSON_DATASET_PATH)
        else:
            raise FileNotFoundError(
                "Neither public_transit.csv nor public_transit.json was found in backend/datasets."
            )

        _transport_df = _apply_nagpur_scenario(_normalize_transport_dataframe(raw_df))
    except Exception as exc:
        print(f"Error loading public transport data: {exc}")
        _transport_df = pd.DataFrame(
            columns=[
                "agency",
                "mode",
                "date",
                "week_number",
                "current_ridership",
                "year",
                "hour",
                "weekday",
                "month",
                "date_only",
            ]
        )

    return _transport_df


def calculate_transport_overview(df: pd.DataFrame) -> dict[str, float | int]:
    if df.empty:
        return {
            "total_ridership": 0,
            "active_agencies": 0,
            "average_daily_ridership": 0.0,
            "ridership_growth_percent": 0.0,
        }

    daily_ridership = df.groupby("date_only", as_index=False)["current_ridership"].sum().sort_values("date_only")
    latest_seven_days = daily_ridership.tail(7)
    previous_seven_days = daily_ridership.iloc[max(len(daily_ridership) - 14, 0) : max(len(daily_ridership) - 7, 0)]

    latest_total = float(latest_seven_days["current_ridership"].sum())
    previous_total = float(previous_seven_days["current_ridership"].sum())

    if previous_total == 0:
        growth_percent = 100.0 if latest_total > 0 else 0.0
    else:
        growth_percent = ((latest_total - previous_total) / previous_total) * 100

    return {
        "total_ridership": int(df["current_ridership"].sum()),
        "active_agencies": int(df["agency"].nunique()),
        "average_daily_ridership": round(float(df["current_ridership"].mean()), 2),
        "ridership_growth_percent": round(growth_percent, 2),
    }


def get_ridership_trend(df: pd.DataFrame) -> list[dict[str, str | int]]:
    if df.empty:
        return []

    trend_df = df.groupby("date_only", as_index=False)["current_ridership"].sum().sort_values("date_only")
    return [
        {
            "date": row["date_only"].strftime("%Y-%m-%d"),
            "ridership": int(row["current_ridership"]),
        }
        for _, row in trend_df.iterrows()
    ]


def get_agency_utilization(df: pd.DataFrame) -> list[dict[str, str | int]]:
    if df.empty:
        return []

    agency_df = (
        df.groupby("agency", as_index=False)["current_ridership"]
        .sum()
        .sort_values(["current_ridership", "agency"], ascending=[False, True])
    )
    return [
        {
            "agency": row["agency"],
            "ridership": int(row["current_ridership"]),
        }
        for _, row in agency_df.iterrows()
    ]


def get_weekly_ridership(df: pd.DataFrame) -> list[dict[str, int]]:
    if df.empty:
        return []

    weekly_df = (
        df.groupby("week_number", as_index=False)["current_ridership"]
        .sum()
        .sort_values("week_number")
    )
    return [
        {
            "week": int(row["week_number"]),
            "ridership": int(row["current_ridership"]),
        }
        for _, row in weekly_df.iterrows()
    ]
