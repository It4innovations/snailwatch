# Snailwatch dashboard
This is a React dashboard for visualising benchmark results
stored in Snailwatch.

REST API documentation can be found [here](https://snailwatch.readthedocs.io/en/latest/api.html).

We recommend the Docker setup that can be found in the README at the root of the repository.
However if you want to deploy the server manually, you can use the
following commands:

```bash
$ pip install -r requirements.txt # install libraries
$ ADMIN_TOKEN=abc DB_DIR=~/snailwatch python start.py
```

You can find additional information about the server deployment
[here](https://snailwatch.readthedocs.io/en/latest/server-deploy.html).
