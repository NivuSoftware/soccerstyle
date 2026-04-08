from marshmallow import Schema, fields

from schemas.product_schema import ProductImageSchema


class BannerSchema(Schema):
    id = fields.Integer(required=True)
    imagen = fields.Nested(ProductImageSchema, required=True)
    created_at = fields.String(required=True)
    updated_at = fields.String(required=True)
