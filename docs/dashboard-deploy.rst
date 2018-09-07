Dashboard deployment
====================
The dashboard is a React app that connects to the API server and visualizes the collected measurements.
You can deploy it either using Docker (recommended) or by using manual setup.

Docker
------
We provide a docker image with the dashboard. You can either pull a prebuilt image from the ``kobzol/snailwatch``
repository on DockerHub or build it yourself using the Dockerfile located in the ``dashboard`` directory.

.. code-block:: bash

    # pull prebuilt image
    $ docker pull kobzol/snailwatch:dashboard

    # or build it yourself
    $ docker build -t sw-dashboard -f dashboard/Dockerfile

The app inside the container is located at ``/dashboard`` and is by default served on port 3000.


Installation and build
----------------------
You can install dependencies of the dashboard using npm:

.. code-block:: bash

    # install dependencies
    $ cd dashboard
    $ npm install

    # create a production version in the `build` directory
    $ npm run build

Configuration
-------------
When deploying the dashboard, you should provide the address of the API server
using an environment variable.

+----------------+------------+-----------------------+-------------------------------------+
| Name           | Required   | Default               | Description                         |
+================+============+=======================+=====================================+
| API_SERVER     | False      | http://localhost:5000 | Address of the Snailwatch server.   |
+----------------+------------+-----------------------+-------------------------------------+

Starting the dashboard
----------------------

.. code-block:: bash

    # Start using Docker
    $ docker run -e "API_SERVER=http://my-deployed-server" -p 3000:3000 sw-dashboard

    # Start directly
    $ API_SERVER=http://my-deployed-server node build/server.js

Deploying at non-root path
--------------------------
It is possible to deploy the dashboard at a non-root URL (e. g. /my-dashboard).
You have to pass the URL to the dashboard both during the build and launch
of the Docker container.

.. code-block:: bash

    $ docker build -t sw-dashboard --build-arg PUBLIC_URL=/my-dashboard .
    $ docker run -e "URL_PREFIX=/my-dashboard" ... sw-dashboard
