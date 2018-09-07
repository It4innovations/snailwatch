Server deployment
=================
To deploy the service, you can either use our provided Docker images (recommended) or setup the dependencies manually.
The server requires a MongoDB instance, that is not included in the Docker container.

Docker
------
We provide a docker image with the API server. You can either pull a prebuilt image from the ``kobzol/snailwatch``
repository on DockerHub or build it yourself using the Dockerfile located in the ``server`` directory.

.. code-block:: bash

    # pull prebuilt image
    $ docker pull kobzol/snailwatch:server

    # or build it yourself
    $ docker build -t sw-server -f server/Dockerfile

The app inside the container is located at ``/server`` and is by default server on port 5000.


Manual installation
-------------------
You can install the dependencies of the server with pip. Snailwatch should be compatible with Python 2 and 3:

.. code-block:: bash

    $ cd server
    $ pip install -r requirements.txt


Configuration
-------------
The server can be configured with the following environment variables:

+--------------------+------------+------------------+--------------------------------------------------------+
| Name               | Required   | Default          | Description                                            |
+====================+============+==================+========================================================+
| ADMIN_TOKEN        | True       |                  | Authentication token used for administrative actions.  |
+--------------------+------------+------------------+--------------------------------------------------------+
| MONGO_HOST         | False      | localhost        | Address of MongoDB server.                             |
+--------------------+------------+------------------+--------------------------------------------------------+
| MONGO_PORT         | False      | 27017            | Port of MongoDB server.                                |
+--------------------+------------+------------------+--------------------------------------------------------+
| MONGO_DB           | False      | snailwatch       | Name of MongoDB database.                              |
+--------------------+------------+------------------+--------------------------------------------------------+
| MONGO_USERNAME     | False      |                  | Auth username for MongoDB server.                      |
+--------------------+------------+------------------+--------------------------------------------------------+
| MONGO_PASSWORD     | False      |                  | Auth password for MongoDB server.                      |
+--------------------+------------+------------------+--------------------------------------------------------+
| PORT               | False      | 5000             | TCP port used by the API server.                       |
+--------------------+------------+------------------+--------------------------------------------------------+

Running the server
------------------
After you install and configure the server, you have to start the MongoDB instance and afterwards you
can launch the server itself using:

.. code-block:: bash

    # Start using Docker (MongoDB instance has to be available in its network)
    $ docker run -e "ADMIN_TOKEN=abc" -p 5000:5000 sw-server

    # Start directly
    $ python start.py
