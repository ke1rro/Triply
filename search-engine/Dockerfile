FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
COPY ./main.py /app/main.py
COPY ./engine /app/engine
COPY ./data /data

ENV ENGINE_PORT=80
ENV ENGINE_HOST=""

EXPOSE 80

CMD ["python", "main.py"]
