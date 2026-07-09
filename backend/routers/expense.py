from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from database import get_db
from repository.expense import ExpenseRepository
from schemas.expense import ExpenseCreate, ExpenseResponse


router = APIRouter(prefix="/expenses", tags=["expenses"])


def _raise_expense_not_found() -> None:
	"""Lanza una respuesta 404 uniforme cuando el gasto no existe."""
	raise HTTPException(
		status_code=status.HTTP_404_NOT_FOUND,
		detail="Expense not found",
	)


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)) -> ExpenseResponse:
	"""Crea un gasto nuevo delegando la persistencia al repositorio."""
	repository = ExpenseRepository(db)
	return repository.create(expense)


@router.get("", response_model=list[ExpenseResponse])
def list_expenses(
	start_date: date | None = Query(default=None, description="Fecha inicial del rango a filtrar."),
	end_date: date | None = Query(default=None, description="Fecha final del rango a filtrar."),
	category: str | None = Query(default=None, description="Categoria exacta a filtrar."),
	search: str | None = Query(default=None, description="Texto parcial a buscar en la descripcion."),
	db: Session = Depends(get_db),
) -> list[ExpenseResponse]:
	"""Devuelve gastos opcionalmente filtrados por fechas, categoria y descripcion."""
	repository = ExpenseRepository(db)
	return repository.get_all(
		start_date=start_date,
		end_date=end_date,
		category=category,
		search=search,
	)


@router.get("/summary")
def get_expenses_summary(
	months: int = Query(default=6, ge=1, description="Cantidad de meses a incluir en el resumen mensual."),
	include_all_months: bool = Query(
		default=False,
		description="Cuando es true, devuelve el historial mensual completo.",
	),
	db: Session = Depends(get_db),
) -> dict[str, Any]:
	"""Devuelve el resumen general, mensual y por categoria de los gastos."""
	repository = ExpenseRepository(db)
	return repository.get_summary(months=None if include_all_months else months)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, db: Session = Depends(get_db)) -> ExpenseResponse:
	"""Obtiene un gasto por identificador y devuelve 404 si no existe."""
	repository = ExpenseRepository(db)
	expense = repository.get_by_id(expense_id)
	if expense is None:
		_raise_expense_not_found()

	return expense


@router.put("/{expense_id}", response_model=ExpenseResponse, status_code=status.HTTP_200_OK)
def update_expense(
	expense_id: int,
	expense_update: ExpenseCreate,
	db: Session = Depends(get_db),
) -> ExpenseResponse:
	"""Actualiza un gasto existente y devuelve 404 si el registro no existe."""
	repository = ExpenseRepository(db)
	updated_expense = repository.update(expense_id, expense_update)
	if updated_expense is None:
		_raise_expense_not_found()

	return updated_expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)) -> Response:
	"""Elimina un gasto existente y devuelve 404 si no se encuentra."""
	repository = ExpenseRepository(db)
	deleted = repository.delete(expense_id)
	if not deleted:
		_raise_expense_not_found()

	return Response(status_code=status.HTTP_204_NO_CONTENT)
