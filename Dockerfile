FROM mongo:3-jessie

# install system dependencies
RUN apt-get update &&                               \
    apt-get install -y --no-install-recommends      \
        curl git python python-pip &&               \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y --no-install-recommends      \
        nodejs

WORKDIR /app
RUN git clone https://code.it4i.cz/beranekj/snailwatch \
    --branch master --single-branch --depth=1 .

WORKDIR /app/server
RUN pip install -r requirements.txt

WORKDIR /app/dashboard
COPY --from=kobzol/snailwatch:dashboard /dashboard /app/dashboard

EXPOSE 3000
EXPOSE 5000

WORKDIR /app/dashboard
CMD mongod & npm start & python ../server/start.py
