"""Pydantic request/response schemas for the auth router.

These DTOs are the only types the router exposes to the outside world
— ORM models stay inside the brain. Field validation is delegated to
Pydantic so a malformed email or short password is rejected before
any DB work happens.
"""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.auth.password import MIN_PASSWORD_LENGTH


class RegisterRequest(BaseModel):
    """Body of POST /auth/register."""

    email: EmailStr
    password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=1024)
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)


class LoginRequest(BaseModel):
    """Body of POST /auth/login."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=1024)


class RefreshRequest(BaseModel):
    """Body of POST /auth/refresh."""

    refresh_token: str = Field(min_length=1)


class TokenPair(BaseModel):
    """Response body for /auth/login and /auth/refresh.

    The access token's expiry is reported in seconds as ``expires_in``
    so a JS client can schedule a refresh without parsing the JWT.
    The refresh token is opaque to clients — they store it and present
    it back; the brain manages rotation.
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds until access_token expiry


class UserOut(BaseModel):
    """Response body for /auth/me and the user portion of /register."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    first_name: str | None
    last_name: str | None
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login_at: datetime | None


class RegisterResponse(BaseModel):
    """POST /auth/register response — user + initial token pair."""

    user: UserOut
    tokens: TokenPair
