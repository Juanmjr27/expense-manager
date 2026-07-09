from datetime import date as ExpenseDate, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    """Schema para crear un nuevo gasto con validaciones."""
    
    amount: float = Field(
        ...,
        gt=0,
        description="Amount is required and must be greater than 0.",
    )
    category: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Category is required and must contain between 2 and 100 characters.",
    )
    description: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Description is optional and cannot exceed 255 characters.",
    )
    date: ExpenseDate = Field(
        ...,
        description="Date is required and must be a valid date.",
    )


class ExpenseResponse(BaseModel):
    """Schema para devolver datos de un gasto."""
    
    id: int
    amount: float
    category: str
    description: str | None = None
    date: ExpenseDate
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)