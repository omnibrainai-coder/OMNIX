from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return FileResponse("templates/login.html")

@app.get("/home")
async def home():
    return FileResponse("templates/home.html")

@app.get("/search")
async def search():
    return FileResponse("templates/search.html")

@app.get("/create")
async def create():
    return FileResponse("templates/create.html")

@app.get("/chat")
async def chat():
    return FileResponse("templates/chat.html")

@app.get("/profile")
async def profile():
    return FileResponse("templates/profile.html")

@app.get("/signup")
async def signup():
    return FileResponse("templates/signup.html")
