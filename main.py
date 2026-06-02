from fastapi import FastAPI
from fastapi.responses import FileResponse

from database import Base, engine
import models

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
async def root():
    return FileResponse("templates/login.html")

@app.get("/login")
async def login():
    return FileResponse("templates/login.html")

@app.get("/signup")
async def signup():
    return FileResponse("templates/signup.html")

@app.get("/home")
async def home():
    return FileResponse("templates/home.html")
