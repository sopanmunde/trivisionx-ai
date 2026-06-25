from pydantic import BaseModel, EmailStr

class ContactCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    subject: str
    message: str
