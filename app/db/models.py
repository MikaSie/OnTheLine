from datetime import datetime

from sqlalchemy import DateTime, Float, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# This is how a catch is stored in the database table


class Base(DeclarativeBase):
    pass


class CatchModel(Base):
    __tablename__ = "catches"

    catch_id: Mapped[str] = mapped_column(String, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    lat: Mapped[float] = mapped_column(Float)
    lon: Mapped[float] = mapped_column(Float)

    species: Mapped[str] = mapped_column(String)
    caught_at: Mapped[datetime] = mapped_column(DateTime)
    length_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    method_category: Mapped[str] = mapped_column(String, nullable=True)
    technique_detail: Mapped[str | None] = mapped_column(String, nullable=True)
    depth_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
    # catch and release
