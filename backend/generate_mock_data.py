import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

os.makedirs('datasets', exist_ok=True)

# Create date range for 30 days
dates = pd.date_range(end=datetime.now().replace(minute=0, second=0, microsecond=0), periods=24*30, freq='h')
junctions = [1, 2, 3, 4]

data = []
idx = 1
for dt in dates:
    for j in junctions:
        hour = dt.hour
        # Peak hours around 8 AM and 6 PM
        if 7 <= hour <= 9:
            base = 150
        elif 16 <= hour <= 19:
            base = 180
        elif 0 <= hour <= 5:
            base = 20
        else:
            base = 80
        
        # Add junction multiplier
        base = base * (1 + j * 0.1)
        
        # Add random noise
        vehicles = int(max(0, np.random.normal(base, base * 0.2)))
        
        data.append({
            'DateTime': dt.strftime('%Y-%m-%d %H:%M:%S'),
            'Junction': j,
            'Vehicles': vehicles,
            'ID': str(idx)
        })
        idx += 1

df = pd.DataFrame(data)
df.to_csv('datasets/traffic.csv', index=False)
print("Mock traffic dataset generated at datasets/traffic.csv")
