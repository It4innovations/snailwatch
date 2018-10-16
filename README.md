# Snailwatch
This repository contains code for the continous performance monitoring service
**Snailwatch**.

Snailwatch is a database for your benchmark results that can automatically
notify you when a performance regression is detected. It also
offers a dashboard with historical trends of your app's performance.

You can find its documentation [here](https://snailwatch.readthedocs.io/en/latest).

### Repository structure

- **server** - Snailwatch service (REST API + database)
- **dashboard** - web dashboard for visualising benchmark results
- **client** - helper Python library for uploading measurements

### Quick setup
To use Snailwatch, you first have to deploy it.
If you want to quickly deploy both the server and the dashboard with Docker,
just run the following command in the root of the repository:

```bash
$ ADMIN_TOKEN=... DB_DIR=~/snailwatch docker-compose up
```

This will start both the server and the dashboard at once. The server
will be available at `http://localhost:5000` and the dashboard will
be available at `http://localhost:3000`.

ADMIN_TOKEN is a secret token required for admin actions and DB_DIR
specifies in which directory should the database be stored.

### Authors

- Jakub Beránek (jakub.beranek@vsb.cz)
- Stanislav Böhm (stanislav.bohm@vsb.cz)

### License
Snailwatch is MIT licensed.
