# Expense Manager

Aplicación full-stack para gestionar gastos personales, desarrollada siguiendo **Spec-Driven Development (SDD)**.

## Tecnologías

**Backend**
- FastAPI
- SQLAlchemy + SQLite
- Pydantic v2

**Frontend**
- HTML5 + Bootstrap 5
- Vanilla JavaScript

**Metodología**
- Spec-Driven Development con GitHub Spec Kit

## Funcionalidades principales

- Dashboard con resúmenes (total gastado, por mes y por categoría)
- Registro completo de gastos
- Listado con filtros avanzados (fecha, monto, categoría, descripción)
- Búsqueda parcial en descripciones
- Persistencia en base de datos SQLite

## Cómo ejecutar el proyecto

1. Clona este repositorio
2. Instala las dependencias del backend:
   ```bash
   pip install "fastapi[standard]" sqlalchemy