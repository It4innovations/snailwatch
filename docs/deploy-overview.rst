Overview
========
You have to deploy Snailwatch before you can use it. Snailwatch consists of an
API server and a dashboard. Those two parts are independent of each other and
are thus deployed separately.

The easiest way how to deploy Snailwatch is with Docker.
There is an example Docker compose setup can be found in the root of the
repository (``docker-compose.yml``). It launches both the server and the dashboard
along with a MongoDB instance and connects them together.

If you have docker-compose installed, you can launch Snailwatch with this command:

.. code-block:: bash

    $ ADMIN_TOKEN=abc DB_DIR=~/snailwatch docker-compose up

| `ADMIN_TOKEN` is required for executing administrative tasks (e.g. creating users).
| `DB_DIR` is a directory where the MongoDB storage will be placed.

The server will be available at port 5000 and the dashboard at port 3000 on
localhost. You can change these ports by passing the environment variables
`SERVER_PORT` and `DASHBOARD_PORT` to the compose script.

For more advanced deployment options and additional configuration, check the
:doc:`server <server-deploy>` and :doc:`dashboard <dashboard-deploy>` deployment
guides.
