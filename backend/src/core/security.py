import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
import hashlib
from src.core.config import settings
from src.database.mongodb.connection import get_database
from src.core.constants import COLLECTION_USERS
from src.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")


def _users():
    return get_database()[COLLECTION_USERS]

def get_password_hash(password: str) -> str:
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_hash.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password_hash = hashlib.sha256(plain_password.encode()).hexdigest()
    try:
        return bcrypt.checkpw(plain_password_hash.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        return False

async def get_user(email: str):
    return await _users().find_one({"email": email})

async def authenticate_user(email: str, password: str):
    user = await get_user(email)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = await get_user(email=token_data.email)
    if user is None:
        raise credentials_exception
    return user
