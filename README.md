<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 💳 ACCOUNTS - SERVICES

API para gestión de **usuarios**, **cuentas** y **transacciones** bancarias (depósitos, retiros y transferencias).  
Incluye **JWT auth**, **validaciones**, **mapeo de errores** consistente y **documentación Swagger**.

---

## 🚀 Descripción general

Este servicio expone endpoints para la **gestión de usuarios, cuentas y transacciones bancarias**, incluyendo depósitos, retiros y transferencias entre cuentas.

Está diseñado con **capas independientes (Domain, Application, Infrastructure, Interface)** para mantener separación de responsabilidades, escalabilidad y facilidad de prueba.

---

## 🚀 Stack & características

- **Runtime**: Node.js 20
- **Framework**: NestJS 11
- **DB**: PostgreSQL
- **ORM**: TypeORM 0.3
- **Auth**: JWT (passport-jwt)
- **Tests**: Jest (+ ts-jest)
- **Lint/Format**: ESLint 9 + Prettier + Husky + lint-staged
- **Docs**: Swagger/OpenAPI

---

## 📁 Estructura principal (Resumen)

```
src/
├── app                     # Casos de uso (application layer) + DTOs
├── domain                  # Entidades y contratos (ports/repositories)
│   ├── accounts
│   ├── auth
│   └── transactions
├── infra
│   ├── auth                # JwtStrategy
│   ├── config              # typeorm.config / datasource
│   └── db/typeorm          # Entities + Repositories + Migrations
├── interface
│   ├── accounts            # AuthController (+ AuthModule)
│   ├── auth                # AccountsController (+ AccountsModule)
│   └── transactions        # TransactionsController (+ TransactionsModule)
├── common                  # DomainError, ErrorCodes, mapDbError
├── main.ts                 # Bootstrap + CORS + Swagger + ValidationPipe + Filter
```

---

## ⚙️ Variables de entorno

Crea un `.env` (o usa variables del shell). **No subas secretos al repo**.

```
PORT=3000
JWT_SECRET=super-secret

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=bank
DB_SSL=false
```

---

## 🧪 Quick Start (paso a paso)

1. Instalar

```bash
npm i
```

2. Variables

```bash
cp .env.example .env   # o crea .env como arriba
```

3. DB (local o docker compose para Postgres)
4. Migraciones

```bash
npm run migration:run
```

5. Levantar

```bash
npm run
```

6. Probar

```bash
open http://localhost:3000/docs
```

---

## 🧪 Tests

```
npm run test
```

Los tests cubren casos de uso, controladores y manejo de errores.

---

## 🐳 Docker Compose

```
version: '3.9'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: bank
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
volumes:
  bank_pgdata:
```

1. **Primera vez** (para correr migraciones/seeds automáticamente):

```bash
docker compose down -v
docker compose up -d db
```

2. Ver estado y logs:

```bash
docker compose ps -a
docker compose logs -f db
docker compose logs -f api
```

3. Verifica API:

```bash
curl -i http://localhost:3000/
```

---

## 🧱 Migraciones / Init de BD

**Datasource TypeORM**: src/infra/config/typeorm.datasource.ts
**Comandos**:

```bash
# Generar migración
npm run migration:generate

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert

```

---

## 📘 Documentación (Swagger)

- **Swagger UI**: `http://localhost:3000/api/docs`

Incluye ejemplos, esquemas DTO, códigos de respuesta y autenticación JWT.

---

## 🔐 Autenticación

- Autenticación por **JWT (Bearer Token)**.
- Registro y login en `/auth/register` y `/auth/login`.
- Los endpoints protegidos usan `@UseGuards(AuthGuard('jwt'))`.
  luir:

```
Authorization: Bearer <TOKEN>
```

**Ejemplos**:

```bash
# register
curl -s -X POST http://localhost:3000/auth/register   -H 'Content-Type: application/json'   -d '{
  "email": "user@bank.com",
  "password": "secret"
}'

# login
curl -s -X POST http://localhost:3000/auth/login   -H 'Content-Type: application/json'   -d '{
  "email": "user@bank.com",
  "password": "secret"
}'

# profile
curl -s http://localhost:3000/accounts  -H "Authorization: Bearer <TOKEN>"
```

---

## 🔎 Endpoints

**Auth**
| Method | Path | Description |
| ------ | -----------------| -----------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login user (JWT) |

**Accounts (Bearer)**
| Method | Path | Description |
| ------ | ------------------------------ | -------------------------------------- |
| POST | `/accounts` | Create cuenta |
| GET | `/accounts` | Listar mis cuentas |
| GET | `/accounts/:id` | Obtener cuenta por ID |
| PATCH | `/accounts/:id/transactions` | Listar las transacciones de una cuenta |

**Transactions (Bearer)**
| Method | Path | Description |
| ------ | ------------------------ | --------------------------- |
| POST | `/transactions` | Crear deposito/retiro |
| POST | `/transactions/transfer` | Transferir entre cuentas |
| GET | `/transactions/me` | Listar mis transacciones |

---

## 🧰 Scripts útiles

| Comando                      | Descripción                           |
| ---------------------------- | ------------------------------------- |
| `npm run start:dev`          | Inicia el servidor en modo desarrollo |
| `npm run build`              | Compila el proyecto                   |
| `npm run migration:generate` | Genera una nueva migración            |
| `npm run migration:run`      | Ejecuta migraciones pendientes        |
| `npm run migration:revert`   | Revierte la última migración          |
| `npm run test`               | Ejecuta los tests                     |
| `npm run test:cov`           | Muestra cobertura de tests            |

> En Docker el build usa `--ignore-scripts` para evitar `husky` en instalaciones.

---

## 🔒 Seguridad

- Nunca subas llaves reales a `.env`, `.env.example` o commits.
- GitHub Push Protection puede bloquear pushes con posibles secretos. Usa **placeholders**.

---

## ✅ Checklist

- [x] JWT auth funcionando
- [x] Swagger con Bearer y DTOs
- [x] Validaciones y errores consistentes
- [x] Migraciones aplicadas
- [x] Tests unitarios con cobertura
- [x] CORS habilitado para Angular (`:4200`)

---

## 🚀 CI/CD with GitHub Actions

This project uses **GitHub Actions** to automate:

- **CI (Continuous Integration)**:
  - Install dependencies
  - Run unit tests
  - Validate coverage
  - Automatic deployment to DEV.

### Main workflows:

- `.github/workflows/ci.yml` → runs on PRs into `develop` and `main`

---

## 🧾 Créditos

- **Autor:** Darly Vergara
- **Fecha:** Octubre 2025
