import pandas as pd
import numpy as np

def calculate_overview(df: pd.DataFrame):
    if df.empty:
        return {
            "congestion_index": 0.0,
            "average_speed": 60.0,
            "active_hotspots": 0,
            "vehicles_per_minute": 0.0
        }
        
    # Assuming latest timestamp as 'current' context
    latest_time = df['DateTime'].max()
    current_df = df[df['DateTime'] == latest_time]
    
    current_vehicle_count = current_df['Vehicles'].sum()
    max_vehicle_count = df.groupby('DateTime')['Vehicles'].sum().max()
    
    congestion_index = (current_vehicle_count / max_vehicle_count) * 100 if max_vehicle_count > 0 else 0
    congestion_index = min(100.0, max(0.0, congestion_index)) # clamp
    
    average_speed = 60 * (1 - congestion_index / 100)
    
    vehicles_per_minute = df['Vehicles'].mean() / 60
    
    # active_hotspots = junctions above 75th percentile vehicle count
    if not current_df.empty:
        percentile_75 = np.percentile(current_df['Vehicles'], 75)
        # Hotspots are unique junctions that pass the 75th percentile of current vehicle count
        active_hotspots = len(current_df[current_df['Vehicles'] > percentile_75]['Junction'].unique())
    else:
        active_hotspots = 0

    return {
        "congestion_index": round(congestion_index, 1),
        "average_speed": round(average_speed, 1),
        "active_hotspots": active_hotspots,
        "vehicles_per_minute": round(vehicles_per_minute, 1)
    }

def hourly_trend(df: pd.DataFrame):
    if df.empty: return []
    
    # Ensure datetime object
    df['DateTime'] = pd.to_datetime(df['DateTime'])
    latest_time = df['DateTime'].max()
    
    # Filter today (last 24 hours)
    today_start = latest_time - pd.Timedelta(hours=24)
    df_today = df[(df['DateTime'] > today_start) & (df['DateTime'] <= latest_time)].copy()
    
    # Filter yesterday (24-48 hours ago)
    yesterday_start = today_start - pd.Timedelta(hours=24)
    df_yesterday = df[(df['DateTime'] > yesterday_start) & (df['DateTime'] <= today_start)].copy()
    
    df_today['hour'] = df_today['DateTime'].dt.hour
    df_yesterday['hour'] = df_yesterday['DateTime'].dt.hour
    
    today_trend = df_today.groupby('hour')['Vehicles'].mean().to_dict()
    yesterday_trend = df_yesterday.groupby('hour')['Vehicles'].mean().to_dict()
    
    # Ensure JSON serializable formatting and chronological hours
    results = []
    # Plot from 0 to 23 hours
    for h in range(24):
        # Only add hours that exist or 0
        results.append({
            "hour": h,
            "today": round(today_trend.get(h, 0), 1),
            "yesterday": round(yesterday_trend.get(h, 0), 1)
        })
    return results

def junction_analysis(df: pd.DataFrame):
    if df.empty: return []
    ja = df.groupby('Junction')['Vehicles'].mean().reset_index()
    return [{"junction": int(row['Junction']), "vehicles": round(row['Vehicles'], 1)} for _, row in ja.iterrows()]
