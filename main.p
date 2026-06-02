from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

HTML = """
<html>
<body>
<h1>OMNI.X</h1>
<h3>Private Social Network</h3>
<button>Login</button>
</body>
</html>
"""

@app.get("/", response_class=HTMLResponse)
async def home():
    return HTML

