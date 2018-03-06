FROM python:3.5-slim

# install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git

# install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

WORKDIR /server
COPY . .

EXPOSE 5000

CMD python start.py
