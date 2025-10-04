# 🏦 Bank Backend API

Backend desarrollado en **NestJS + TypeORM + PostgreSQL**, implementando **Arquitectura Limpia**, autenticación JWT y soporte para Swagger.

---

## 🚀 Descripción general

Este servicio expone endpoints para la **gestión de usuarios, cuentas y transacciones bancarias**, incluyendo depósitos, retiros y transferencias entre cuentas.

Está diseñado con **capas independientes (Domain, Application, Infrastructure, Interface)** para mantener separación de responsabilidades, escalabilidad y facilidad de prueba.

---

## 🧩 Arquitectura del proyecto

```
src/
├── app
│   ├── accounts
│   │   ├── dto
│   │   │   └── create-account.dto.ts
│   │   └── use-cases
│   │       ├── create-account.usecase.ts
│   │       ├── get-account.usecase.ts
│   │       ├── list-account-transactions.usecase.ts
│   │       └── list-my-accounts.usecase.ts
│   ├── auth
│   │   ├── dto
│   │   │   ├── login-user.dto.ts
│   │   │   └── register-user.dto.ts
│   │   └── use-cases
│   │       ├── login-user.usecase.ts
│   │       └── register-user.usecase.ts
│   └── transactions
│       ├── dto
│       │   ├── create-transaction.dto.ts
│       │   ├── create-transfer.dto.ts
│       │   ├── list-account-transactions.query.ts
│       │   ├── list-user-transactions.query.ts
│       │   └── transaction-response.dto.ts
│       └── use-cases
│           ├── create-transaction.usecase.ts
│           ├── create-transfer.usecase.ts
│           └── list-user-transactions.usecase.ts
├── domain
│   ├── accounts
│   ├── auth
│   └── transactions
├── infra
│   ├── auth
│   ├── config
│   └── db/typeorm
├── interface
│   ├── accounts
│   ├── auth
│   └── transactions
├── common
├── main.ts
└── types
```

---

## ⚙️ Instalación y configuración

### 1️⃣ Requisitos previos

- Node.js ≥ 20.x
- PostgreSQL ≥ 14
- npm ≥ 10.x

### 2️⃣ Clonar el repositorio

```bash
git clone <repo-url>
cd backend_app
```

### 3️⃣ Instalar dependencias

```bash
npm install
```

### 4️⃣ Variables de entorno (.env)

Ejemplo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=bank_db
JWT_SECRET=supersecretkey
PORT=3000
```

### 5️⃣ Migraciones TypeORM

```bash
npm run migration:run
```

---

## 🧠 Autenticación

- Autenticación por **JWT (Bearer Token)**.
- Registro y login en `/auth/register` y `/auth/login`.
- Los endpoints protegidos usan `@UseGuards(AuthGuard('jwt'))`.

---

## 💳 Endpoints principales

### 🔐 **Auth**

| Método | Endpoint         | Descripción                    |
| ------ | ---------------- | ------------------------------ |
| POST   | `/auth/register` | Registra un nuevo usuario      |
| POST   | `/auth/login`    | Inicia sesión y devuelve token |

### 🧾 **Accounts**

| Método | Endpoint                     | Descripción                               |
| ------ | ---------------------------- | ----------------------------------------- |
| POST   | `/accounts`                  | Crea una cuenta bancaria                  |
| GET    | `/accounts`                  | Lista las cuentas del usuario autenticado |
| GET    | `/accounts/:id`              | Obtiene detalle de una cuenta             |
| GET    | `/accounts/:id/transactions` | Lista las transacciones de una cuenta     |

### 💸 **Transactions**

| Método | Endpoint                 | Descripción                             |
| ------ | ------------------------ | --------------------------------------- |
| POST   | `/transactions`          | Crea un depósito o retiro               |
| POST   | `/transactions/transfer` | Realiza una transferencia entre cuentas |
| GET    | `/transactions/me`       | Lista las transacciones del usuario     |

---

## 🧪 Pruebas

Se utiliza **Jest** para pruebas unitarias y de integración.

```bash
npm run test
npm run test:cov
```

Los tests cubren casos de uso, controladores y manejo de errores.

---

## 🧱 Docker

### Desarrollo local

```bash
docker compose up -d --build
```

El backend se ejecutará en:

```
http://localhost:3000
```

Y Swagger en:

```
http://localhost:3000/docs
```

---

## 📘 Documentación Swagger

Disponible en:

```
http://localhost:3000/docs
```

Incluye ejemplos, esquemas DTO, códigos de respuesta y autenticación JWT.

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

---

## 🧑‍💻 Autor

Desarrollado por **Darlys Vergara**  
Backend Developer — Prueba Técnica de Arquitectura Limpia + NestJS + PostgreSQL
