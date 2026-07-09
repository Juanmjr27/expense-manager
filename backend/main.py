from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db
from routers.expense import router as expense_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Inicializa los recursos compartidos al arrancar la aplicacion."""
    init_db()
    yield


app = FastAPI(title="Expense Manager API", lifespan=lifespan)

# Permite que el frontend se conecte al backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir el router de gastos.
app.include_router(expense_router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Devuelve errores de validacion en un formato simple y consistente."""
    details: list[dict[str, str]] = []
    for error in exc.errors():
        location = [str(part) for part in error.get("loc", []) if part != "body"]
        details.append(
            {
                "field": ".".join(location) if location else "request",
                "message": error.get("msg", "Invalid input."),
            }
        )

    return JSONResponse(
        status_code=422,
        content={
            "error": "Invalid request data.",
            "details": details,
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Devuelve respuestas HTTP de error con una estructura consistente."""
    if isinstance(exc.detail, dict):
        error_message = exc.detail.get("message", "Request failed.")
        details = exc.detail
    else:
        error_message = str(exc.detail)
        details = {"message": error_message}

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": error_message,
            "details": details,
        },
    )


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "✅ Expense Manager API está funcionando correctamente!"}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "healthy", "framework": "FastAPI"}