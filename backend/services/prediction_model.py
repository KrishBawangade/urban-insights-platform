import pandas as pd
from sklearn.linear_model import LinearRegression

def predict_next_step(df: pd.DataFrame):
    """
    Uses LinearRegression from scikit-learn.
    Trains on historical vehicle trends to predict the next time step for each junction.
    """
    if df.empty or len(df) < 2:
        return []
        
    predictions = []
    
    # Predict for each junction separately
    for junction in df['Junction'].unique():
        junction_df = df[df['Junction'] == junction].copy()
        
        if len(junction_df) < 2:
            continue
            
        # Group by time to get total vehicles progressing over the time horizon
        time_df = junction_df.groupby('DateTime')['Vehicles'].sum().reset_index()
        time_df = time_df.sort_values('DateTime')
        
        # Use dataframe index as the linear time feature
        X = time_df.index.values.reshape(-1, 1)
        y = time_df['Vehicles'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict next time step (+1 index)
        next_index = [[len(time_df)]]
        prediction = model.predict(next_index)[0]
        
        predictions.append({
            "junction": int(junction),
            "predicted_vehicles": max(0, int(prediction))
        })
        
    return predictions
