from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "OnTheLine"
    debug: bool = True
    db_name: str = "ontheline.db"

    @property
    def base_dir(self) -> Path:
        return Path(__file__).resolve().parents[2]

    @property
    def db_path(self) -> Path:
        return self.base_dir / "app" / "db" / self.db_name

    @property
    def db_url(self) -> str:
        return f"sqlite:///{self.db_path}"


config = Config()
