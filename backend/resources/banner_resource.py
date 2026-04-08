import shutil
from pathlib import Path

from db import db
from flask import request, send_from_directory
from flask_smorest import Blueprint, abort
from models import Banner
from werkzeug.utils import secure_filename

from auth_utils import jwt_required
from schemas.banner_schema import BannerSchema
from schemas.common_schema import MessageSchema

BANNERS_IMAGE_DIR = Path(__file__).resolve().parent.parent / "banners"
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

banners_bp = Blueprint(
    "banners",
    __name__,
    url_prefix="/api/banners",
    description="CRUD de banners promocionales",
)


def _build_banner_image_url(banner_id):
    return f"/api/banners/{banner_id}/image"


def _serialize_banner(banner):
    return {
        "id": banner.id,
        "imagen": {
            "filename": banner.image_filename,
            "url": _build_banner_image_url(banner.id),
        },
        "created_at": banner.created_at.isoformat(),
        "updated_at": banner.updated_at.isoformat(),
    }


def _find_banner(banner_id):
    return db.session.get(Banner, banner_id)


def _get_uploaded_image(required=False):
    image_file = request.files.get("imagen")
    if required and (not image_file or not image_file.filename):
        abort(400, message="Debes subir una imagen para el banner")
    return image_file


def _store_banner_image(banner_id, image_file):
    original_name = secure_filename(image_file.filename)
    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        abort(400, message="Formato de imagen no soportado. Usa jpg, jpeg, png o webp")

    image_dir = BANNERS_IMAGE_DIR / str(banner_id)
    image_dir.mkdir(parents=True, exist_ok=True)

    for existing_file in image_dir.iterdir():
        if existing_file.is_file():
            existing_file.unlink()

    stored_name = f"banner{extension}"
    image_file.save(image_dir / stored_name)
    return stored_name


@banners_bp.route("/", methods=["GET"])
@banners_bp.response(200, BannerSchema(many=True))
def list_banners():
    banners = Banner.query.order_by(Banner.updated_at.desc()).all()
    return [_serialize_banner(item) for item in banners]


@banners_bp.route("/<int:banner_id>", methods=["GET"])
@banners_bp.response(200, BannerSchema)
def get_banner(banner_id):
    banner = _find_banner(banner_id)
    if not banner:
        abort(404, message="Banner no encontrado")

    return _serialize_banner(banner)


@banners_bp.route("/<int:banner_id>/image", methods=["GET"])
def get_banner_image(banner_id):
    banner = _find_banner(banner_id)
    if not banner:
        abort(404, message="Banner no encontrado")

    image_dir = BANNERS_IMAGE_DIR / str(banner_id)
    image_path = image_dir / banner.image_filename
    if not image_path.exists():
        abort(404, message="Imagen no encontrada")

    return send_from_directory(image_dir, banner.image_filename)


@banners_bp.route("/", methods=["POST"])
@jwt_required(admin_only=True)
@banners_bp.response(201, BannerSchema)
def create_banner():
    image_file = _get_uploaded_image(required=True)

    banner = Banner(image_filename="pending")
    db.session.add(banner)
    db.session.flush()

    banner.image_filename = _store_banner_image(banner.id, image_file)
    db.session.commit()
    return _serialize_banner(banner)


@banners_bp.route("/<int:banner_id>", methods=["PUT"])
@jwt_required(admin_only=True)
@banners_bp.response(200, BannerSchema)
def update_banner(banner_id):
    banner = _find_banner(banner_id)
    if not banner:
        abort(404, message="Banner no encontrado")

    image_file = _get_uploaded_image(required=True)
    banner.image_filename = _store_banner_image(banner.id, image_file)
    db.session.commit()
    return _serialize_banner(banner)


@banners_bp.route("/<int:banner_id>", methods=["DELETE"])
@jwt_required(admin_only=True)
@banners_bp.response(200, MessageSchema)
def delete_banner(banner_id):
    banner = _find_banner(banner_id)
    if not banner:
        abort(404, message="Banner no encontrado")

    db.session.delete(banner)
    db.session.commit()

    banner_dir = BANNERS_IMAGE_DIR / str(banner_id)
    if banner_dir.exists():
        shutil.rmtree(banner_dir)

    return {"message": "Banner eliminado correctamente"}
