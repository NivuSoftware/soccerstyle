from auth_utils import hash_password
from app import create_app
from db import db
from models import User

ADMIN_EMAIL = "admin@soccerstyle.com"
ADMIN_PASSWORD = "soccerstyle*2026"


def seed_admin():
    app = create_app()

    with app.app_context():
        password_hash = hash_password(ADMIN_PASSWORD)
        existing_user = User.query.filter_by(email=ADMIN_EMAIL).first()

        if existing_user:
            existing_user.nombre = "Administrador"
            existing_user.role = "admin"
            existing_user.password_hash = password_hash
            action = "actualizado"
        else:
            db.session.add(
                User(
                    nombre="Administrador",
                    email=ADMIN_EMAIL,
                    role="admin",
                    password_hash=password_hash,
                )
            )
            action = "creado"

        db.session.commit()
        print(f"Usuario administrador {action}: {ADMIN_EMAIL}")


if __name__ == "__main__":
    seed_admin()
