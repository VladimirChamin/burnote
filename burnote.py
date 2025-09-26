from fastapi import FastAPI

app = FastAPI(title="Popugai App")

@app.get("/")
async def get_popugai():
    return {"message": "Hi popugai"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
