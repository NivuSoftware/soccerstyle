import os
import time
from urllib.parse import quote_plus

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

db = SQLAlchemy()


def build_database_url():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    user = os.getenv("POSTGRES_USER", "soccerstyle_admin")
    password = quote_plus(os.getenv("POSTGRES_PASSWORD", "soccerstyle_password"))
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    database = os.getenv("POSTGRES_DB", "soccerstyle")
    return f"postgresql+psycopg://{user}:{password}@{host}:{port}/{database}"


def init_database(app):
    db.init_app(app)

    max_attempts = int(os.getenv("DB_CONNECT_MAX_ATTEMPTS", "20"))
    retry_delay = float(os.getenv("DB_CONNECT_RETRY_DELAY", "2"))

    with app.app_context():
        from models import Banner, Product, User  # noqa: F401

        last_error = None

        for attempt in range(1, max_attempts + 1):
            try:
                db.session.execute(text("SELECT 1"))
                db.create_all()
                _run_lightweight_migrations()
                db.session.commit()
                return
            except OperationalError as exc:
                db.session.rollback()
                last_error = exc

                if attempt == max_attempts:
                    raise

                print(
                    f"Intento {attempt}/{max_attempts} de conexion a la base de datos fallido. "
                    f"Reintentando en {retry_delay} segundos..."
                )
                time.sleep(retry_delay)

        if last_error:
            raise last_error


def _run_lightweight_migrations():
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS estado VARCHAR(20)
            """
        )
    )
    db.session.execute(
        text(
            """
            UPDATE products
            SET estado = 'ACTIVO'
            WHERE estado IS NULL OR estado = ''
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ALTER COLUMN estado SET DEFAULT 'ACTIVO'
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ALTER COLUMN estado SET NOT NULL
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS gift BOOLEAN
            """
        )
    )
    db.session.execute(
        text(
            """
            UPDATE products
            SET gift = FALSE
            WHERE gift IS NULL
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ALTER COLUMN gift SET DEFAULT FALSE
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ALTER COLUMN gift SET NOT NULL
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS categoria VARCHAR(50)
            """
        )
    )
    db.session.execute(
        text(
            """
            UPDATE products
            SET categoria = 'accesorios'
            WHERE categoria IS NULL OR categoria = ''
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ALTER COLUMN categoria SET DEFAULT 'accesorios'
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ALTER COLUMN categoria SET NOT NULL
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS destacar BOOLEAN
            """
        )
    )
    db.session.execute(
        text(
            """
            UPDATE products
            SET destacar = FALSE
            WHERE destacar IS NULL
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ALTER COLUMN destacar SET DEFAULT FALSE
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ALTER COLUMN destacar SET NOT NULL
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS image_filenames JSON
            """
        )
    )
    db.session.execute(
        text(
            """
            UPDATE products
            SET image_filenames = json_build_array(image_filename)
            WHERE image_filenames IS NULL
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ALTER COLUMN image_filenames SET DEFAULT '[]'::json
            """
        )
    )
    db.session.execute(
        text(
            """
            ALTER TABLE products
            ALTER COLUMN image_filenames SET NOT NULL
            """
        )
    )
