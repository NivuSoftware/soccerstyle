from marshmallow import Schema, fields


class LoginRequestSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)


class AuthUserSchema(Schema):
    id = fields.Integer(required=True)
    nombre = fields.String(required=True)
    email = fields.Email(required=True)
    role = fields.String(required=True)


class LoginResponseSchema(Schema):
    access_token = fields.String(required=True)
    token_type = fields.String(required=True)
    expires_in = fields.Integer(required=True)
    user = fields.Nested(AuthUserSchema, required=True)
