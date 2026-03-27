from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Config(BaseSettings):
    app_name: str = "OnTheLine"
    debug: bool = True
    db_name: str = "ontheline.db"

    @property
    def db_url(self):
        return f"sqlite:///./{self.db_name}"


config = Config()
