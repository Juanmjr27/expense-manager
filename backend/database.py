from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from models.expense import Base


# Ruta absoluta a la raiz del proyecto para construir una ubicacion robusta
# de la base de datos sin depender del directorio de ejecucion actual.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATABASE_DIR = PROJECT_ROOT / "database"
DATABASE_PATH = DATABASE_DIR / "expenses.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

# SQLite requiere esta opcion cuando la aplicacion reutiliza conexiones en
# distintos contextos del request lifecycle de FastAPI.
engine = create_engine(
	DATABASE_URL,
	connect_args={"check_same_thread": False},
)

# SessionLocal es la fabrica de sesiones que se inyectara en los endpoints.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
	"""Provee una sesion de base de datos por request y asegura su cierre."""
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


def init_db() -> None:
	"""Crea el directorio y las tablas definidas por los modelos SQLAlchemy."""
	DATABASE_DIR.mkdir(parents=True, exist_ok=True)
	Base.metadata.create_all(bind=engine)
