FROM python:3.5-slim

WORKDIR /server

COPY . .

# install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git

# install Python dependencies
RUN pip install -r requirements.txt

EXPOSE 5000

CMD python start.py
