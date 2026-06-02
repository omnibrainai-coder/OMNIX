from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    fullname = Column(String(100))
    username = Column(String(50), unique=True)

    email = Column(String(100), unique=True)

    mobile = Column(String(20))

    password = Column(String(200))
