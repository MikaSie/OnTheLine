from flask import Flask

from app.api.routes import routes
from app.core.config import config
from app.core.logging import setup_logging
from app.db.models import Base
from app.db.session import engine

setup_logging()


def create_app() -> Flask:
    app = Flask(config.app_name)

    Base.metadata.create_all(bind=engine)

    app.register_blueprint(routes)
    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=config.debug)
