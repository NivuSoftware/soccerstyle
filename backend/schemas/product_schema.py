from marshmallow import Schema, fields


class ProductImageSchema(Schema):
    filename = fields.String(required=True)
    url = fields.String(required=True)


class ProductSchema(Schema):
    id = fields.Integer(required=True)
    nombre = fields.String(required=True)
    categoria = fields.String(required=True)
    estado = fields.String(required=True)
    destacar = fields.Boolean(required=True)
    gift = fields.Boolean(required=True)
    tallas_disponibles = fields.List(fields.String(), required=True)
    precio = fields.Float(required=True)
    imagen = fields.Nested(ProductImageSchema, required=True)
    imagenes = fields.List(fields.Nested(ProductImageSchema), required=True)
    created_at = fields.String(required=True)
    updated_at = fields.String(required=True)
