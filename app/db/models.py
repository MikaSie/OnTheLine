from sqlalchemy import String, Float, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime

# This is how a catch is stored in the database table


class Base(DeclarativeBase):
    pass


class CatchModel(Base):
    __tablename__ = "catches"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    lat: Mapped[float] = mapped_column(Float)
    lon: Mapped[float] = mapped_column(Float)
    species: Mapped[str] = mapped_column(String)
    technique: Mapped[str | None] = mapped_column(String, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)
