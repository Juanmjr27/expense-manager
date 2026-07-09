from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Float, Integer, String
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func


Base = declarative_base()


class Expense(Base):
	__tablename__ = "expenses"

	id = Column(Integer, primary_key=True, index=True)
	amount = Column(Float, nullable=False)
	category = Column(String(100), nullable=False, index=True)
	description = Column(String(255), nullable=True)
	date = Column(Date, nullable=False)
	created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	def __repr__(self) -> str:
		return (
			f"Expense(id={self.id!r}, amount={self.amount!r}, "
			f"category={self.category!r}, date={self.date!r})"
		)
