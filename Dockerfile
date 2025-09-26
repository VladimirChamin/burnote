FROM python:3.11-slim

WORKDIR /burnote

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p static/js static templates

RUN if [ ! -f manifest.json ]; then echo '{"name": "My App", "version": "1.0.0"}' > manifest.json; fi

EXPOSE 8000

# Для разработки с hot reload
CMD ["uvicorn", "burnote:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

