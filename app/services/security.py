from pwdlib import PasswordHash

# Initialize Argon2 password hashing
password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Generate a secure hash from a plain-text password."""
    return password_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its stored hash."""
    return password_hasher.verify(password, hashed_password)
