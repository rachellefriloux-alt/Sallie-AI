"""Repository pattern over the brain's ORM models.

Each repository wraps an :class:`~sqlalchemy.ext.asyncio.AsyncSession`
and exposes only the operations the auth router actually needs. This
keeps query logic out of the route handlers, makes the routes trivial
to read, and gives us a single place to add audit-logging hooks in
Phase 1.3.
"""
