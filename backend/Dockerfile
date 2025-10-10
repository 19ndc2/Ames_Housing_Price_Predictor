FROM pytorch/pytorch:2.1.0-cpu

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT 8080
EXPOSE $PORT

CMD gunicorn -b 0.0.0.0:$PORT wsgi:app