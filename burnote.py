from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
import os
import uvicorn

app = FastAPI()

# Монтируем статические файлы
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def index():
    return templates.TemplateResponse("index.html", {"request": {}})

@app.get("/service-worker.js")
async def service_worker():
    # Проверяем существование файла в static, если нет - берем из templates
    if os.path.exists("static/service-worker.js"):
        return FileResponse("static/service-worker.js", media_type="application/javascript")
    elif os.path.exists("templates/service-worker.js"):
        return FileResponse("templates/service-worker.js", media_type="application/javascript")
    else:
        raise HTTPException(status_code=404, detail="Service worker not found")

@app.get("/manifest.json")
async def manifest():
    if not os.path.exists("manifest.json"):
        raise HTTPException(status_code=404, detail="Manifest file not found")
    
    with open('manifest.json', 'r') as f:
        manifest_data = json.load(f)
    
    return JSONResponse(content=manifest_data)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)