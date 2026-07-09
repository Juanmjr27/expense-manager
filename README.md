# Expense Manager

![License](https://img.shields.io/badge/license-MIT-blue) 
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.138.2-green)

Aplicación **full-stack** para gestionar gastos personales, desarrollada siguiendo **Spec-Driven Development (SDD)**.

## Tecnologías

**Backend**
- FastAPI
- SQLAlchemy + SQLite
- Pydantic v2

**Frontend**
- HTML5 + Bootstrap 5
- Vanilla JavaScript

**Metodología**
- Spec-Driven Development (SDD) con GitHub Spec Kit

## Funcionalidades

- **Dashboard** con resúmenes (total gastado, por mes y por categoría)
- Registro completo de gastos
- Listado con filtros avanzados (fecha, monto, categoría, descripción)
- Búsqueda parcial en descripciones
- Persistencia en base de datos SQLite

## Capturas

![Dashboard](https://github.com/Juanmjr27/expense-manager/blob/main/screenshots/dashboard.png)
![Listado](https://github.com/Juanmjr27/expense-manager/blob/main/screenshots/listado.png)

## Cómo ejecutar

1. Clona el repositorio
2. Instala dependencias:
   ```bash
   pip install "fastapi[standard]" sqlalchemy