from datetime import date
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.expense import Expense
from schemas.expense import ExpenseCreate


class ExpenseRepository:
	def __init__(self, db: Session) -> None:
		self.db = db

	def create(self, expense: ExpenseCreate) -> Expense:
		db_expense = Expense(**expense.model_dump())
		self.db.add(db_expense)
		self.db.commit()
		self.db.refresh(db_expense)
		return db_expense

	def get_all(
		self,
		start_date: date | None = None,
		end_date: date | None = None,
		category: str | None = None,
		search: str | None = None,
	) -> list[Expense]:
		"""Devuelve gastos filtrados opcionalmente por fecha, categoria y descripcion."""
		query = self.db.query(Expense)

		if start_date is not None:
			query = query.filter(Expense.date >= start_date)

		if end_date is not None:
			query = query.filter(Expense.date <= end_date)

		if category:
			# Se normaliza el valor antes de filtrar para evitar espacios accidentales.
			normalized_category = category.strip()
			if normalized_category:
				query = query.filter(Expense.category == normalized_category)

		if search:
			# La busqueda usa coincidencia parcial e ignora mayusculas/minusculas.
			normalized_search = search.strip()
			if normalized_search:
				query = query.filter(Expense.description.ilike(f"%{normalized_search}%"))

		return query.order_by(Expense.date.desc()).all()

	def get_summary(self, months: int | None = 6) -> dict[str, Any]:
		"""Calcula totales generales, mensuales y por categoria para los gastos."""
		totals_row = self.db.query(
			func.coalesce(func.sum(Expense.amount), 0.0).label("total_amount"),
			func.count(Expense.id).label("total_expenses"),
		).one()

		total_amount = float(totals_row.total_amount or 0.0)
		total_expenses = int(totals_row.total_expenses or 0)

		month_expression = func.strftime("%Y-%m", Expense.date)
		monthly_query = (
			self.db.query(
				month_expression.label("month"),
				func.coalesce(func.sum(Expense.amount), 0.0).label("total_amount"),
			)
			.group_by(month_expression)
			.order_by(month_expression.desc())
		)

		if months is not None:
			monthly_query = monthly_query.limit(months)

		monthly_summary = [
			{"month": row.month, "total_amount": round(float(row.total_amount or 0.0), 2)}
			for row in monthly_query.all()
		]

		category_summary_rows = (
			self.db.query(
				Expense.category.label("category"),
				func.coalesce(func.sum(Expense.amount), 0.0).label("total_amount"),
			)
			.group_by(Expense.category)
			.order_by(func.sum(Expense.amount).desc(), Expense.category.asc())
			.all()
		)

		category_summary = []
		for row in category_summary_rows:
			category_total = float(row.total_amount or 0.0)
			percentage = round((category_total / total_amount) * 100, 2) if total_amount else 0.0
			category_summary.append(
				{
					"category": row.category,
					"total_amount": round(category_total, 2),
					"percentage": percentage,
				}
			)

		return {
			"total_amount": round(total_amount, 2),
			"total_expenses": total_expenses,
			"monthly_totals": monthly_summary,
			"category_totals": category_summary,
		}

	def get_by_id(self, id: int) -> Expense | None:
		return self.db.query(Expense).filter(Expense.id == id).first()

	def update(self, id: int, expense_update: ExpenseCreate | dict[str, Any]) -> Expense | None:
		db_expense = self.get_by_id(id)
		if db_expense is None:
			return None

		update_data = (
			expense_update.model_dump(exclude_unset=True)
			if isinstance(expense_update, ExpenseCreate)
			else expense_update
		)

		for field, value in update_data.items():
			setattr(db_expense, field, value)

		self.db.commit()
		self.db.refresh(db_expense)
		return db_expense

	def delete(self, id: int) -> bool:
		db_expense = self.get_by_id(id)
		if db_expense is None:
			return False

		self.db.delete(db_expense)
		self.db.commit()
		return True
