import os

from flask import Flask
from flask_cors import CORS
from flask_smorest import Api
from dotenv import load_dotenv
from db import build_database_url, init_database
from resources.auth_resource import auth_bp
from resources.banner_resource import banners_bp
from resources.mail_resource import mail_bp
from resources.product_resource import products_bp

load_dotenv()  # Cargar variables desde .env

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.url_map.strict_slashes = False

    # Configuración de Swagger
    app.config["API_TITLE"] = "SoccerStyle API"
    app.config["API_VERSION"] = "v1"
    app.config["OPENAPI_VERSION"] = "3.0.3"
    app.config["OPENAPI_URL_PREFIX"] = "/"
    app.config["OPENAPI_SWAGGER_UI_PATH"] = "/swagger-ui"
    app.config["OPENAPI_SWAGGER_UI_URL"] = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY",
        "change-this-secret-in-production",
    )
    app.config["JWT_EXPIRATION_HOURS"] = int(os.getenv("JWT_EXPIRATION_HOURS", "8"))
    app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_CONTENT_LENGTH", str(5 * 1024 * 1024)))
    app.config["SQLALCHEMY_DATABASE_URI"] = build_database_url()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
    }

    api = Api(app)
    api.register_blueprint(mail_bp)
    api.register_blueprint(auth_bp)
    api.register_blueprint(products_bp)
    api.register_blueprint(banners_bp)
    init_database(app)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
