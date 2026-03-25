from flask import Flask
from app.core.config import config
from app.core.logging import setup_logging
from app.api.routes import routes

setup_logging()


def create_app() -> Flask:
    app = Flask(config.app_name)
    app.register_blueprint(routes)
    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=config.debug)
