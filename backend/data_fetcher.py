import requests
import datetime
import pandas as pd
import os
from dotenv import load_dotenv

"""
    #Weather data obtained from Tomorrow.io
    moon_phase = db.Column(db.String(50))
    weather = db.Column(db.String(50))
    wind_speed = db.Column(db.Float)
    wind_direction = db.Column(db.String(50))
    air_temperature = db.Column(db.Float)

    #Water data obtained from RWS
    air_pressure = db.Column(db.Float)
    water_type = db.Column(db.String(50))
    water_temp = db.Column(db.Float)
    water_level = db.Column(db.String(50))
"""

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
    

def get_water_data():
    # Get water data from RWS

    collect_catalogus = ('https://waterwebservices.rijkswaterstaat.nl/' +
                     'METADATASERVICES_DBO/' +
                     'OphalenCatalogus/')
    collect_observations = ('https://waterwebservices.rijkswaterstaat.nl/' +
                        'ONLINEWAARNEMINGENSERVICES_DBO/' +
                        'OphalenWaarnemingen')
    collect_count_observations = ('https://waterwebservices.rijkswaterstaat.nl' +
                              '/ONLINEWAARNEMINGENSERVICES_DBO/CheckWaarnemingenAanwezig')
    

    url = "https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/OphalenWaarnemingen"

    # A short period in October 2023
    start_date_str = "2023-10-01T14:00:00.000+01:00"
    end_date_str =   "2023-10-01T16:00:00.000+01:00"

    # Example location: Vlissingen ("VLIS" code) with X/Y in EPSG:25831
    payload = {
        "Locatie": {
        "Code": "VLISSGN",
        "X": 541425.983214885,
        "Y": 5699181.90968435
        },
        "AquoPlusWaarnemingMetadata": {
            "AquoMetadata": {
                "Compartiment": {"Code": "OW"},   # OW = oppervlaktewater
                "Grootheid":   {"Code": "WATHTE"} # WATHTE = measured water level
            }
        },
        "Periode": {
            "Begindatumtijd": start_date_str,
            "Einddatumtijd": end_date_str
        }
    }

    # Send the POST request
    response = requests.post(url, json=payload)
    print("Status code:", response.status_code)
    print("Response text:", response.text)

    if response.ok:
        data = response.json()
        waarnemingen = data.get("WaarnemingenLijst", [])
        print(f"Number of observation lists: {len(waarnemingen)}")
        if waarnemingen:
            print("Sample observation list:", waarnemingen[0])


    data = response.json()  

    water_data = []

    for waarneming in data["WaarnemingenLijst"]:
        locatie_info = waarneming["Locatie"]
        locatie_code = locatie_info["Code"]
        
        for meting in waarneming["MetingenLijst"]:
            tijdstip = meting["Tijdstip"]   # e.g. '2023-10-01T15:00:00.000+01:00'
            
            meetwaarde = meting["Meetwaarde"]
            waterhoogte_cm = meetwaarde["Waarde_Numeriek"]  # The numeric water level in cm
            
            # Print or collect the data
            print(f"Locatie: {locatie_code}, Tijdstip: {tijdstip}, Waterhoogte: {waterhoogte_cm} cm")
            
            # Append to a list so we can create a DataFrame later
            water_data.append({
                "locatie": locatie_code,
                "tijdstip": tijdstip,
                "waterhoogte_cm": waterhoogte_cm
            })

    # Convert the list to a DataFrame if desired
    df_water = pd.DataFrame(water_data)
    print(df_water)


def fetch_catalogus() -> dict:
    """
    Calls the 'OphalenCatalogus' endpoint to retrieve metadata about locations and measurements.
    Returns the raw JSON dict.
    """
    url = "https://waterwebservices.rijkswaterstaat.nl/METADATASERVICES_DBO/OphalenCatalogus/"

    # Request “OW” (surface water) compartments, “WATHTE” (water height) among others.
    # But we'll keep it generic for demonstration:
    payload = {
        "CatalogusFilter": {
            "Compartimenten": True,
            "Grootheden": True,
            "Parameters": True,
            "Eenheden": True,
            "Hoedanigheden": True,
            # Add more if you want more detail: Typeringen, BemonsteringsApparaten, etc.
        }
    }
    
    resp = requests.post(url, json=payload)
    resp.raise_for_status()
    data = resp.json()
    return data

def extract_locations_for_waterlevel(catalogus_data: dict) -> pd.DataFrame:
    """
    From the raw OphalenCatalogus JSON, extract only those locations 
    that measure water level (WATHTE) in surface water (OW).
    Returns a DataFrame with columns: [locatie_code, x, y].
    """
    # Convert 'AquoMetadataLijst' to a DataFrame
    df_metadata = pd.json_normalize(catalogus_data["AquoMetadataLijst"])
    # We only want rows with Grootheid.Code = WATHTE and Compartiment.Code = OW
    df_metadata = df_metadata[
        (df_metadata["Grootheid.Code"] == "WATHTE") &
        (df_metadata["Compartiment.Code"] == "OW")
    ]
    
    # Keep just the columns we need
    df_metadata = df_metadata[["AquoMetadata_MessageID"]]

    # Convert 'LocatieLijst' to a DataFrame
    df_locaties = pd.json_normalize(catalogus_data["LocatieLijst"])
    # Typically has columns: ['Locatie_MessageID', 'Code', 'X', 'Y', ...]

    # Convert 'AquoMetadataLocatieLijst' to a DataFrame
    df_links = pd.json_normalize(catalogus_data["AquoMetadataLocatieLijst"])
    # Typically has columns: ['AquoMetadata_MessageID', 'Locatie_MessageID']

    # Join df_metadata -> df_links -> df_locaties
    df_joined = df_metadata.merge(df_links, on="AquoMetadata_MessageID", how="inner")
    # Now each row has 'Locatie_MessageID'
    df_joined = df_joined.merge(df_locaties, on="Locatie_MessageID", how="inner")

    # We only need Code, X, Y for each location
    # (There can be duplicates if multiple metadata link to the same loc)
    df_locations = df_joined[["Code", "X", "Y"]].drop_duplicates()

    df_locations.rename(columns={
        "Code": "locatie_code",
        "X": "x_coord",
        "Y": "y_coord"
    }, inplace=True)

    return df_locations.reset_index(drop=True)


if __name__ == '__main__':
    #get_water_data()

    catalog_data = fetch_catalogus()
    print("Top-level keys:", catalog_data.keys())

    if "AquoMetadataLocatieLijst" in catalog_data:
        df_links = pd.json_normalize(catalog_data["AquoMetadataLocatieLijst"])
        print("df_links columns:", df_links.columns)
    else:
        print("No 'AquoMetadataLocatieLijst' key found in catalog_data!")
