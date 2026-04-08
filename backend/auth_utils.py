from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, g, request
from flask_smorest import abort
from werkzeug.security import check_password_hash, generate_password_hash


def hash_password(password):
    return generate_password_hash(password, method="pbkdf2:sha256")


def verify_password(password_hash, password):
    return check_password_hash(password_hash, password)


def _get_user_value(user, key, default=None):
    if isinstance(user, dict):
        return user.get(key, default)
    return getattr(user, key, default)


def create_access_token(user):
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=current_app.config["JWT_EXPIRATION_HOURS"])
    payload = {
        "sub": str(_get_user_value(user, "id")),
        "email": _get_user_value(user, "email"),
        "role": _get_user_value(user, "role", "admin"),
        "iat": now,
        "exp": expires_at,
    }
    token = jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")
    expires_in = int((expires_at - now).total_seconds())
    return token, expires_in


def decode_access_token(token):
    try:
        return jwt.decode(
            token,
            current_app.config["JWT_SECRET_KEY"],
            algorithms=["HS256"],
        )
    except jwt.ExpiredSignatureError:
        abort(401, message="El token ha expirado")
    except jwt.InvalidTokenError:
        abort(401, message="Token invalido")


def jwt_required(admin_only=False):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "").strip()
            if not auth_header.startswith("Bearer "):
                abort(401, message="Debes enviar un token Bearer valido")

            token = auth_header.split(" ", 1)[1].strip()
            if not token:
                abort(401, message="Debes enviar un token Bearer valido")

            payload = decode_access_token(token)
            if admin_only and payload.get("role") != "admin":
                abort(403, message="No tienes permisos para realizar esta accion")

            g.current_user = payload
            return fn(*args, **kwargs)

        return wrapper

    return decorator
