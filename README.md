# Login con Google Auth

Una autenticación simple usando NodeJS, donde el frontend consume REST API del backend para login con Google Auth. Se usa diseño demo de theme de argon (free).

Reemplazar en .env /backend y en /frontend

```
GOOGLE_CLIENTID = {CLIENT ID}
GOOGLE_SECRET = {SECRET}
```

## Backend

Se encarga del login y generación de token jwt para el frontend.
```
npm install
```

```
docker-compose -p "mysql-phpmyadmin" up -d 
```

## Frontend

Consume backend REST.

```
npm install
```
