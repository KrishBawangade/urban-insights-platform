import pandas as pd
from datetime import datetime

_df = None

def load_traffic_data():
    """
    Loads the CSV using pandas, converts DateTime, and returns the dataframe.
    Ensures that the dataset is only loaded once (singleton pattern).
    """
    global _df
    if _df is None:
        try:
            _df = pd.read_csv("datasets/traffic.csv")
            _df['DateTime'] = pd.to_datetime(_df['DateTime'])
        except Exception as e:
            print(f"Error loading traffic data: {e}")
            _df = pd.DataFrame() # Fallback to empty context
    return _df
