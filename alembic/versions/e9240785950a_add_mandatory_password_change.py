"""add mandatory password change

Revision ID: e9240785950a
Revises:
"""

from alembic import op
import sqlalchemy as sa

revision = "e9240785950a"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "employees",
        sa.Column(
            "must_change_password",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )


def downgrade() -> None:
    op.drop_column("employees", "must_change_password")
