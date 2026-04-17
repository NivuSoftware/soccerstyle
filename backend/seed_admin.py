import os

from auth_utils import hash_password
from app import create_app
from db import db
from models import User


def seed_admin():
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    admin_nombre = os.getenv("ADMIN_NOMBRE", "Administrador")

    if not admin_email or not admin_password:
        raise RuntimeError(
            "ADMIN_EMAIL y ADMIN_PASSWORD deben estar configuradas en las variables de entorno"
        )

    app = create_app()

    with app.app_context():
        password_hash = hash_password(admin_password)
        existing_user = User.query.filter_by(email=admin_email).first()

        if existing_user:
            existing_user.nombre = admin_nombre
            existing_user.role = "admin"
            existing_user.password_hash = password_hash
            action = "actualizado"
        else:
            db.session.add(
                User(
                    nombre=admin_nombre,
                    email=admin_email,
                    role="admin",
                    password_hash=password_hash,
                )
            )
            action = "creado"

        db.session.commit()
        print(f"Usuario administrador {action}: {admin_email}")


if __name__ == "__main__":
    seed_admin()
