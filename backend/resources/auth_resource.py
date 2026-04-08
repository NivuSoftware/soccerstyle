from flask_smorest import Blueprint, abort

from auth_utils import create_access_token, verify_password
from models import User
from schemas.auth_schema import LoginRequestSchema, LoginResponseSchema

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
    description="Endpoints de autenticacion",
)


@auth_bp.route("/login", methods=["POST"])
@auth_bp.arguments(LoginRequestSchema)
@auth_bp.response(200, LoginResponseSchema)
def login(data):
    email = data["email"].strip().lower()
    password = data["password"]

    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(user.password_hash, password):
        abort(401, message="Credenciales invalidas")

    token, expires_in = create_access_token(user)
    return {
        "access_token": token,
        "token_type": "Bearer",
        "expires_in": expires_in,
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
            "role": user.role,
        },
    }
