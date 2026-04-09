from datetime import datetime

from pydantic import BaseModel, ConfigDict

# When someone sends data to my API to create a catch, this is what I expect
# This is the input format!
# That is why it has nog id and no timestamp because client provides info and
# we generate id and timestamp


class CatchCreate(BaseModel):
    lat: float
    lon: float
    species: str = ""
    technique: str | None = None
    notes: str | None = None


class CatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    catch_id: str
    timestamp: datetime
    lat: float
    lon: float
    species: str
    technique: str | None = None
    notes: str | None = None
