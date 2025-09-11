from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import auth, schemas
from ..database.connection import get_db

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(auth.get_current_user)]
)

@router.get("/me", response_model=schemas.User)
async def read_users_me(
    current_user: Annotated[schemas.User, Depends(auth.get_current_user)]
):
    """
    Get the current logged-in user's details.
    """
    return current_user
