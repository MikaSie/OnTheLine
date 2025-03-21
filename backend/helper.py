import requests
import json
import os
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

def get_weather_data(date, latitude, longitude):
    api_key = os.getenv('TOMORROW_API_KEY')
    params ={
        'location': [latitude, longitude]
    }
    params = {
            'location': 'New York',
            'fields': 'temperature',
            'units': 'imperial',
            'apikey': 'your_api_key',
            'timesteps': '1h',
            'timezone': 'America/New_York',
            'endtime': '2023-03-31T12:00:00Z'
            }
    response = requests.get(f"https://api.tomorrow.io/v4/historical?apikey={api_key}", params=params)
    data = response.json()
    if (response.status_code == 200):
        historical_weather_json = response.json()
        historical_weather_timelines = historical_weather_json['data']['timelines']
        
        timeline = historical_weather_timelines[0]
        title = f"historical_temperature_and_humidity_data_from_{timeline['startTime']}_to_{timeline['endTime']}_in_{timeline['timestep']}_steps-{datetime.datetime.now()}.csv"     
        historical_weather_df = pd.DataFrame(timeline['intervals'])
        historical_weather_df = pd.concat([historical_weather_df.drop(['values'], axis=1), historical_weather_df['values'].apply(pd.Series)], axis=1)
        historical_weather_df.to_csv(title, index=False)
        print(historical_weather_df)
    else:
        print(response.status_code, response.reason)
    return data
    



def get_water_data(date, latitude, longitude):
    pass


result = get_weather_data('2022-01-01', 40.7128, 74.0060)
print(result)