# Soccer Style — Documentación del Proyecto

Tienda online de implementos de fútbol. Catálogo de productos, panel de administración y formulario de contacto.

**Sitio en producción:** https://soccerstyle.com.ec  
**Panel admin:** https://soccerstyle.com.ec/acceso-soccerstyle

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite + TailwindCSS |
| Backend | Python 3.11 + Flask + Gunicorn |
| Base de datos | PostgreSQL 16 |
| Servidor web | nginx (reverse proxy + SSL) |
| Infraestructura | Docker + Docker Compose |
| SSL | Let's Encrypt (Certbot) |
| VPS | 1 vCore · 1 GB RAM · 15 GB NVMe |

---

## Estructura del proyecto

```
SoccerStyle/
├── backend/
│   ├── resources/          # Endpoints REST (auth, productos, banners, mail)
│   ├── schemas/            # Validación de datos (Marshmallow)
│   ├── models.py           # Modelos de base de datos (User, Product, Banner)
│   ├── app.py              # Configuración de Flask
│   ├── db.py               # Inicialización y migraciones de PostgreSQL
│   ├── seed_admin.py       # Crea/actualiza el usuario administrador al iniciar
│   ├── auth_utils.py       # JWT y hashing de contraseñas
│   ├── requirements.txt    # Dependencias Python
│   ├── Dockerfile          # Imagen de producción (Gunicorn)
│   └── .env.example        # Plantilla de variables de entorno
├── frontend/
│   ├── src/
│   │   ├── pages/          # Páginas: Home, Categoría, Producto, Admin, etc.
│   │   ├── components/     # Componentes reutilizables + UI (shadcn)
│   │   ├── services/       # Llamadas a la API (productService, authService…)
│   │   ├── context/        # Estado global (Auth, Catalog, Size…)
│   │   ├── data/           # Datos estáticos y configuración SEO
│   │   └── types/          # Tipos TypeScript
│   ├── public/             # Assets estáticos (imágenes, videos, sitemap)
│   ├── nginx.conf          # Configuración nginx para producción (HTTPS)
│   └── Dockerfile          # Multi-stage: Node build → nginx serve
└── docker-compose.yml      # Orquestación de los 3 servicios
```

---

## Rutas del panel admin

| Ruta | Descripción |
|---|---|
| `/acceso-soccerstyle` | Login del administrador |
| `/panel-admin-soccerstyle` | Dashboard (gestión de productos y banners) |

> Las rutas de admin están ofuscadas intencionalmente. No usar `/admin`.

---

## Variables de entorno

El backend necesita el archivo `backend/.env`. Nunca subir este archivo al repositorio.

```bash
cp backend/.env.example backend/.env
# Editar con los valores reales
```

Variables obligatorias:

| Variable | Descripción |
|---|---|
| `POSTGRES_PASSWORD` | Contraseña de la base de datos |
| `JWT_SECRET_KEY` | Clave secreta para firmar tokens JWT |
| `ADMIN_EMAIL` | Email del usuario administrador |
| `ADMIN_PASSWORD` | Contraseña del administrador |
| `ALLOWED_ORIGINS` | Dominios permitidos para CORS |
| `EMAIL_ADDRESS` | Gmail desde donde se envían los correos |
| `EMAIL_PASSWORD` | Contraseña de aplicación de Gmail |
| `MAIL_RECIPIENT` | Email donde llegan los mensajes del formulario |

Generar un JWT_SECRET_KEY seguro:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## Desarrollo local

### Requisitos
- Docker Desktop instalado y corriendo
- Git

### Levantar el entorno local

```bash
git clone https://github.com/NivuSoftware/soccerstyle.git
cd soccerstyle
cp backend/.env.example backend/.env
# Editar backend/.env con valores locales (ALLOWED_ORIGINS=* para desarrollo)
docker compose up --build
```

- Frontend: http://localhost (puerto 80)
- API: http://localhost/api
- Swagger: http://localhost/swagger-ui

> En local el HTTPS no aplica. El nginx redirige a HTTPS solo en producción.

---

## Flujo de trabajo — Cómo hacer cambios

### 1. Hacer el cambio en el código

Trabaja en tu rama o directamente en `main` según el equipo lo decida.

### 2. Subir los cambios al repositorio

```bash
git add .
git commit -m "descripción del cambio"
git push origin main
```

### 3. Aplicar los cambios en la VPS

Conectarse por SSH a la VPS y ejecutar:

```bash
cd /var/www/soccerstyle
git pull
docker compose up --build -d
```

> El build tarda ~20-30 segundos gracias al caché de Docker.  
> Si el sistema se queda sin memoria durante el build, ver sección **Swap** más abajo.

---

## Qué ejecutar en la VPS según el tipo de cambio

| Tipo de cambio | Comando en la VPS |
|---|---|
| Solo frontend (React, CSS, componentes) | `git pull && docker compose up -d --no-deps --build frontend` |
| Solo backend (Python, endpoints, modelos) | `git pull && docker compose up -d --no-deps --build backend` |
| Ambos (frontend + backend) | `git pull && docker compose up --build -d` |
| Solo variables de entorno (`.env`) | Editar `.env` → `docker compose restart backend` |
| docker-compose.yml | `git pull && docker compose up -d` |

> Usar `--no-deps --build <servicio>` cuando solo cambia un servicio — es más rápido y no interrumpe los demás.

---

## Comandos útiles en la VPS

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend

# Reiniciar todos los servicios
docker compose restart

# Ver uso de memoria y CPU
docker stats --no-stream

# Ver espacio en disco
df -h

# Ver uso de RAM y swap
free -h
```

---

## VPS — Datos de la infraestructura

| Dato | Valor |
|---|---|
| Dominio | soccerstyle.com.ec |
| Directorio del proyecto | `/var/www/soccerstyle` |
| RAM | 1 GB + 2 GB swap |
| Almacenamiento | 15 GB NVMe |
| OS | Ubuntu (Linux) |
| SSL | Let's Encrypt — renovación automática |

### Por qué existe el swap de 2 GB

El build de Node.js (compilar el frontend React) consume ~600 MB de RAM temporalmente. Con solo 1 GB el sistema se cuelga. El swap usa 2 GB del disco NVMe como RAM de respaldo solo durante el build. En operación normal los contenedores caben perfectamente en 1 GB.

### Imágenes de productos y banners

Las imágenes subidas desde el admin se almacenan en **volúmenes Docker persistentes**:
- `soccerstyle_product_images` — imágenes de productos
- `soccerstyle_banner_images` — imágenes de banners

Estos volúmenes sobreviven a reinicios y rebuilds. Para respaldarlos:

```bash
docker run --rm \
  -v soccerstyle_product_images:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/product_images_backup.tar.gz /data
```

---

## SSL — Certificado Let's Encrypt

El certificado se renueva automáticamente cada noche a las 3am mediante un cron:

```bash
# Ver el cron configurado
crontab -l
```

Si necesitas renovar manualmente:

```bash
docker compose stop frontend
sudo certbot renew
docker compose start frontend
```

---

## Modelos de datos

### Product
| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | string | Nombre del producto |
| `categoria` | string | `pupos`, `pupillos`, `futsal`, `guantes`, `ropa`, `accesorios` |
| `estado` | string | `ACTIVO` o `INACTIVO` |
| `destacar` | boolean | Aparece en sección de destacados en la home |
| `gift` | boolean | Marcado como regalo |
| `precio` | decimal | Precio en USD |
| `tallas_disponibles` | JSON | Array de tallas, ej: `["38", "39", "40"]` |
| `image_filenames` | JSON | Array de nombres de archivos de imagen (máx. 5) |

### Banner
| Campo | Tipo | Descripción |
|---|---|---|
| `image_filename` | string | Nombre del archivo de imagen del banner |

---

## API — Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Login, devuelve JWT |
| `GET` | `/api/products/` | No | Lista productos (`?solo_activos=true`) |
| `GET` | `/api/products/:id` | No | Detalle de producto |
| `POST` | `/api/products/` | JWT | Crear producto |
| `PUT` | `/api/products/:id` | JWT | Editar producto |
| `DELETE` | `/api/products/:id` | JWT | Eliminar producto |
| `GET` | `/api/banners/` | No | Lista banners |
| `POST` | `/api/banners/` | JWT | Crear banner |
| `DELETE` | `/api/banners/:id` | JWT | Eliminar banner |
| `POST` | `/api/send-email` | No | Enviar mensaje de contacto |

Documentación interactiva (Swagger): https://soccerstyle.com.ec/swagger-ui

---

## Primer deploy en una VPS nueva

```bash
# 1. Instalar Docker y Git
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER && newgrp docker
sudo apt install git certbot -y

# 2. Agregar swap (necesario para el build con 1 GB RAM)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 3. Firewall
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
sudo ufw --force enable

# 4. Obtener SSL (el dominio debe apuntar a la IP de la VPS)
sudo certbot certonly --standalone -d soccerstyle.com.ec -d www.soccerstyle.com.ec \
  --agree-tos --non-interactive --email admin@soccerstyle.com.ec

# 5. Clonar y configurar
sudo mkdir -p /var/www && sudo chown $USER:$USER /var/www
git clone https://github.com/NivuSoftware/soccerstyle.git /var/www/soccerstyle
cd /var/www/soccerstyle
cp backend/.env.example backend/.env
nano backend/.env   # Completar con valores reales

# 6. Levantar
docker compose up --build -d

# 7. Auto-renovación SSL
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && docker restart soccerstyle-frontend") | crontab -
```
