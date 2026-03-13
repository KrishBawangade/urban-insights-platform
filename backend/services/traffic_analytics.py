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
    df_hour = df.copy()
    df_hour['hour'] = df_hour['DateTime'].dt.hour
    trend = df_hour.groupby('hour')['Vehicles'].mean().reset_index()
    # Ensure JSON serializable formatting
    return [{"hour": int(row['hour']), "vehicles": round(row['Vehicles'], 1)} for _, row in trend.iterrows()]

def junction_analysis(df: pd.DataFrame):
    if df.empty: return []
    ja = df.groupby('Junction')['Vehicles'].mean().reset_index()
    return [{"junction": int(row['Junction']), "vehicles": round(row['Vehicles'], 1)} for _, row in ja.iterrows()]
