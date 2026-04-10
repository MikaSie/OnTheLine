from datetime import datetime

from pydantic import BaseModel, ConfigDict

# When someone sends data to my API to create a catch, this is what I expect
# This is the input format!
# That is why it has nog id and no timestamp because client provides info and
# we generate id and timestamp


class CatchCreate(BaseModel):
    lat: float
    lon: float
    species: str
    caught_at: datetime | None = None
    length_cm: float | None = None
    method_category: str | None = None
    technique_detail: str | None = None
    depth_m: float | None = None
    notes: str | None = None


class CatchUpdate(BaseModel):
    lat: float | None = None
    lon: float | None = None
    species: str | None = None
    caught_at: datetime | None = None
    length_cm: float | None = None
    method_category: str | None = None
    technique_detail: str | None = None
    depth_m: float | None = None
    notes: str | None = None


class CatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    catch_id: str
    created_at: datetime
    lat: float
    lon: float
    species: str
    caught_at: datetime
    length_cm: float | None = None
    method_category: str | None = None
    technique_detail: str | None = None
    depth_m: float | None = None
    notes: str | None = None
