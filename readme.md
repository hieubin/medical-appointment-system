# medical-appointment-system

```
reactjs/                      # React + Axios
  src/
    api/axios.js
    assets/
    components/
    context/
    pages/patient | admin
    styles/
    App.jsx

expressjs/                    # Express MVC + Prisma
  prisma/schema.prisma
  src/
    config/
    models/
    views/
    controllers/
    services/
    middleware/
    routes/
    app.js
    server.js
```

## Chạy cả project

Cần Docker Desktop. Không cần cài Node, npm hay PostgreSQL trên máy.

```bash
docker compose up --build
```

Lệnh này tự build và chạy FE, BE, PostgreSQL, pgAdmin. Không cần copy `.env`.

| Service    | URL                            | Account                    |
|------------|--------------------------------|----------------------------|
| Frontend   | http://localhost:3000          | Vite + HMR                 |
| Backend    | http://localhost:4000/api/health | nodemon --watch         |
| pgAdmin    | http://localhost:5050          | Desktop mode, server PostgreSQL đã gắn sẵn (không hỏi mật khẩu) |
| PostgreSQL | localhost:5432                 | postgres / postgres        |

Tắt: `docker compose down`

Production (nginx, không watch): `docker compose -f docker-compose.prod.yml up --build`
