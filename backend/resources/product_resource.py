import json
import shutil
from pathlib import Path

from db import db
from flask import request, send_from_directory
from flask_smorest import Blueprint, abort
from models import Product
from werkzeug.utils import secure_filename

from auth_utils import jwt_required
from schemas.common_schema import MessageSchema
from schemas.product_schema import ProductSchema

PRODUCTS_IMAGE_DIR = Path(__file__).resolve().parent.parent / "products"

products_bp = Blueprint(
    "products",
    __name__,
    url_prefix="/api/products",
    description="CRUD de productos",
)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_PRODUCT_IMAGES = 5
ALLOWED_CATEGORIES = {
    "pupos",
    "pupillos",
    "futsal",
    "guantes",
    "ropa",
    "accesorios",
}
ALLOWED_PRODUCT_STATES = {"ACTIVO", "INACTIVO"}


def _build_image_url(product_id):
    return f"/api/products/{product_id}/image"


def _build_gallery_image_url(product_id, filename):
    return f"/api/products/{product_id}/images/{filename}"


def _get_product_image_filenames(product):
    image_filenames = product.image_filenames or []
    if image_filenames:
        return image_filenames
    if product.image_filename:
        return [product.image_filename]
    return []


def _serialize_product(product):
    image_filenames = _get_product_image_filenames(product)
    if not image_filenames:
        abort(500, message="El producto no tiene imagenes configuradas")

    primary_image_filename = image_filenames[0]
    return {
        "id": product.id,
        "nombre": product.nombre,
        "categoria": product.categoria,
        "estado": product.estado,
        "destacar": product.destacar,
        "gift": product.gift,
        "tallas_disponibles": product.tallas_disponibles,
        "precio": float(product.precio),
        "imagen": {
            "filename": primary_image_filename,
            "url": _build_image_url(product.id),
        },
        "imagenes": [
            {
                "filename": filename,
                "url": _build_gallery_image_url(product.id, filename),
            }
            for filename in image_filenames
        ],
        "created_at": product.created_at.isoformat(),
        "updated_at": product.updated_at.isoformat(),
    }


def _find_product(product_id):
    return db.session.get(Product, product_id)


def _parse_tallas():
    def normalize_raw_value(raw_value):
        raw_value = raw_value.strip()
        if not raw_value:
            return None

        try:
            parsed = json.loads(raw_value)
            if isinstance(parsed, list):
                normalized_list = [str(item).strip() for item in parsed if str(item).strip()]
                return normalized_list or None
        except json.JSONDecodeError:
            pass

        normalized_list = [item.strip() for item in raw_value.split(",") if item.strip()]
        return normalized_list or None

    tallas = request.form.getlist("tallas") or request.form.getlist("tallas_disponibles")
    if tallas:
        if len(tallas) == 1:
            normalized = normalize_raw_value(tallas[0])
            if normalized:
                return normalized

        normalized = [item.strip() for item in tallas if item.strip()]
        if normalized:
            return normalized

    raw_value = request.form.get("tallas") or request.form.get("tallas_disponibles")
    if not raw_value:
        return None

    return normalize_raw_value(raw_value)


def _parse_precio(raw_value):
    try:
        precio = float(raw_value)
    except (TypeError, ValueError):
        abort(400, message="El precio debe ser un numero valido")

    if precio <= 0:
        abort(400, message="El precio debe ser mayor a 0")

    return round(precio, 2)


def _parse_categoria(raw_value):
    categoria = (raw_value or "").strip().lower()
    if not categoria:
        abort(400, message="La categoria del producto es obligatoria")

    if categoria not in ALLOWED_CATEGORIES:
        abort(400, message="La categoria enviada no es valida")

    return categoria


def _parse_boolean(raw_value, field_name, default=False):
    if raw_value is None:
        return default

    if isinstance(raw_value, bool):
        return raw_value

    normalized_value = str(raw_value).strip().lower()
    if normalized_value in {"true", "1", "yes", "on"}:
        return True
    if normalized_value in {"false", "0", "no", "off", ""}:
        return False

    abort(400, message=f"El valor de {field_name} debe ser true o false")


def _parse_destacar(raw_value, default=False):
    return _parse_boolean(raw_value, "destacar", default=default)


def _parse_gift(raw_value, default=False):
    return _parse_boolean(raw_value, "gift", default=default)


def _parse_estado(raw_value, default="ACTIVO"):
    if raw_value is None:
        return default

    estado = str(raw_value).strip().upper()
    if estado not in ALLOWED_PRODUCT_STATES:
        abort(400, message="El estado del producto debe ser ACTIVO o INACTIVO")

    return estado


def _get_uploaded_images():
    image_files = [file for file in request.files.getlist("imagenes") if file and file.filename]
    if image_files:
        return image_files

    image_file = request.files.get("imagen")
    if image_file and image_file.filename:
        return [image_file]

    return []


def _parse_existing_images_to_keep(product):
    current_filenames = _get_product_image_filenames(product)
    if "imagenes_existentes_json" not in request.form:
        return current_filenames

    raw_value = request.form.get("imagenes_existentes_json", "[]")
    try:
        parsed_filenames = json.loads(raw_value)
    except json.JSONDecodeError:
        abort(400, message="El listado de imagenes existentes no es valido")

    if not isinstance(parsed_filenames, list):
        abort(400, message="El listado de imagenes existentes no es valido")

    normalized_filenames = []
    seen_filenames = set()
    for item in parsed_filenames:
        filename = str(item).strip()
        if not filename:
            continue

        if filename not in current_filenames:
            abort(400, message="Una de las imagenes seleccionadas no pertenece al producto")

        if filename in seen_filenames:
            continue

        seen_filenames.add(filename)
        normalized_filenames.append(filename)

    return normalized_filenames


def _store_product_images(product_id, retained_filenames, new_image_files):
    total_images = len(retained_filenames) + len(new_image_files)
    if total_images == 0:
        abort(400, message="Debes conservar o enviar al menos una imagen para el producto")

    if total_images > MAX_PRODUCT_IMAGES:
        abort(400, message=f"Puedes subir hasta {MAX_PRODUCT_IMAGES} imagenes por producto")

    image_dir = PRODUCTS_IMAGE_DIR / str(product_id) / "img"
    image_dir.mkdir(parents=True, exist_ok=True)

    retained_files = []
    for filename in retained_filenames:
        image_path = image_dir / filename
        if not image_path.exists():
            abort(400, message="Una de las imagenes existentes no fue encontrada")

        retained_files.append((filename, image_path.read_bytes()))

    for existing_file in image_dir.iterdir():
        if existing_file.is_file():
            existing_file.unlink()

    stored_names = []
    next_index = 1

    for original_name, image_bytes in retained_files:
        extension = Path(original_name).suffix.lower()
        if extension not in ALLOWED_IMAGE_EXTENSIONS:
            abort(400, message="Formato de imagen no soportado. Usa jpg, jpeg, png o webp")

        stored_name = f"product-{next_index}{extension}"
        (image_dir / stored_name).write_bytes(image_bytes)
        stored_names.append(stored_name)
        next_index += 1

    for image_file in new_image_files:
        original_name = secure_filename(image_file.filename)
        extension = Path(original_name).suffix.lower()
        if extension not in ALLOWED_IMAGE_EXTENSIONS:
            abort(400, message="Formato de imagen no soportado. Usa jpg, jpeg, png o webp")

        stored_name = f"product-{next_index}{extension}"
        image_file.save(image_dir / stored_name)
        stored_names.append(stored_name)
        next_index += 1

    return stored_names


@products_bp.route("/", methods=["GET"])
@products_bp.response(200, ProductSchema(many=True))
def list_products():
    only_active = _parse_boolean(
        request.args.get("solo_activos") or request.args.get("soloActivos"),
        "solo_activos",
        default=False,
    )
    query = Product.query
    if only_active:
        query = query.filter(Product.estado == "ACTIVO")
    products = query.order_by(Product.updated_at.desc()).all()
    return [_serialize_product(item) for item in products]


@products_bp.route("/<int:product_id>", methods=["GET"])
@products_bp.response(200, ProductSchema)
def get_product(product_id):
    product = _find_product(product_id)
    if not product:
        abort(404, message="Producto no encontrado")

    only_active = _parse_boolean(
        request.args.get("solo_activos") or request.args.get("soloActivos"),
        "solo_activos",
        default=False,
    )
    if only_active and product.estado != "ACTIVO":
        abort(404, message="Producto no encontrado")

    return _serialize_product(product)


@products_bp.route("/<int:product_id>/image", methods=["GET"])
def get_product_image(product_id):
    product = _find_product(product_id)
    if not product:
        abort(404, message="Producto no encontrado")

    image_filenames = _get_product_image_filenames(product)
    if not image_filenames:
        abort(404, message="Imagen no encontrada")

    image_dir = PRODUCTS_IMAGE_DIR / str(product_id) / "img"
    image_path = image_dir / image_filenames[0]
    if not image_path.exists():
        abort(404, message="Imagen no encontrada")

    return send_from_directory(image_dir, image_filenames[0])


@products_bp.route("/<int:product_id>/images/<path:filename>", methods=["GET"])
def get_product_gallery_image(product_id, filename):
    product = _find_product(product_id)
    if not product:
        abort(404, message="Producto no encontrado")

    image_filenames = _get_product_image_filenames(product)
    if filename not in image_filenames:
        abort(404, message="Imagen no encontrada")

    image_dir = PRODUCTS_IMAGE_DIR / str(product_id) / "img"
    image_path = image_dir / filename
    if not image_path.exists():
        abort(404, message="Imagen no encontrada")

    return send_from_directory(image_dir, filename)


@products_bp.route("/", methods=["POST"])
@jwt_required(admin_only=True)
@products_bp.response(201, ProductSchema)
def create_product():
    nombre = (request.form.get("nombre") or "").strip()
    if not nombre:
        abort(400, message="El nombre del producto es obligatorio")

    categoria = _parse_categoria(request.form.get("categoria"))
    tallas = _parse_tallas()
    if not tallas:
        abort(400, message="Debes enviar al menos una talla disponible")

    precio = _parse_precio(request.form.get("precio"))
    estado = _parse_estado(request.form.get("estado"), default="ACTIVO")
    destacar = _parse_destacar(request.form.get("destacar"), default=False)
    gift = _parse_gift(request.form.get("gift"), default=False)
    image_files = _get_uploaded_images()
    product = Product(
        nombre=nombre,
        categoria=categoria,
        estado=estado,
        destacar=destacar,
        gift=gift,
        tallas_disponibles=tallas,
        precio=precio,
        image_filename="pending",
        image_filenames=[],
    )
    db.session.add(product)
    db.session.flush()

    image_filenames = _store_product_images(product.id, [], image_files)
    product.image_filenames = image_filenames
    product.image_filename = image_filenames[0]
    db.session.commit()
    return _serialize_product(product)


@products_bp.route("/<int:product_id>", methods=["PUT"])
@jwt_required(admin_only=True)
@products_bp.response(200, ProductSchema)
def update_product(product_id):
    product = _find_product(product_id)
    if not product:
        abort(404, message="Producto no encontrado")

    nombre = request.form.get("nombre")
    if nombre is not None:
        nombre = nombre.strip()
        if not nombre:
            abort(400, message="El nombre del producto no puede estar vacio")
        product.nombre = nombre

    if request.form.get("categoria") is not None:
        product.categoria = _parse_categoria(request.form.get("categoria"))

    if request.form.get("estado") is not None:
        product.estado = _parse_estado(request.form.get("estado"))

    if request.form.get("destacar") is not None:
        product.destacar = _parse_destacar(request.form.get("destacar"))

    if request.form.get("gift") is not None:
        product.gift = _parse_gift(request.form.get("gift"))

    tallas = _parse_tallas()
    if tallas is not None:
        product.tallas_disponibles = tallas

    if request.form.get("precio") is not None:
        product.precio = _parse_precio(request.form.get("precio"))

    image_files = _get_uploaded_images()
    retained_filenames = _parse_existing_images_to_keep(product)
    current_image_filenames = _get_product_image_filenames(product)
    if image_files or retained_filenames != current_image_filenames:
        image_filenames = _store_product_images(product_id, retained_filenames, image_files)
        product.image_filenames = image_filenames
        product.image_filename = image_filenames[0]

    if not product.tallas_disponibles:
        abort(400, message="El producto debe conservar al menos una talla disponible")

    db.session.commit()
    return _serialize_product(product)


@products_bp.route("/<int:product_id>", methods=["DELETE"])
@jwt_required(admin_only=True)
@products_bp.response(200, MessageSchema)
def delete_product(product_id):
    product = _find_product(product_id)
    if not product:
        abort(404, message="Producto no encontrado")

    db.session.delete(product)
    db.session.commit()

    product_dir = PRODUCTS_IMAGE_DIR / str(product_id)
    if product_dir.exists():
        shutil.rmtree(product_dir)

    return {"message": "Producto eliminado correctamente"}
