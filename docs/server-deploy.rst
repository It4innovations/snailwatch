Server deployment
=================
Installation
------------
You can install the dependencies of the server with pip::

    $ cd server
    $ pip install -r requirements.txt

Configuration
-------------
Before you can upload and visualise the data, you first have to configure
and launch the server. It is a Flask application that uses MongoDB for data
storage. It can be configured with the following environment variables:

+--------------------+------------+------------------+--------------------------------------------------------+
| Name               | Required   | Default          | Description                                            |
+====================+============+==================+========================================================+
| ADMIN_TOKEN        | True       |                  | Authentication token used for administrative actions.  |
+--------------------+------------+------------------+--------------------------------------------------------+
| MONGO_HOST         | True       | localhost        | Address of MongoDB server.                             |
+--------------------+------------+------------------+--------------------------------------------------------+
| MONGO_PORT         | True       | 27017            | Port of MongoDB server.                                |
+--------------------+------------+------------------+--------------------------------------------------------+
| MONGO_DB           | True       | snailwatch       | Name of MongoDB database.                              |
+--------------------+------------+------------------+--------------------------------------------------------+
| MONGO_USERNAME     | False      |                  | Auth username for MongoDB server.                      |
+--------------------+------------+------------------+--------------------------------------------------------+
| MONGO_PASSWORD     | False      |                  | Auth password for MongoDB server.                      |
+--------------------+------------+------------------+--------------------------------------------------------+
| PORT               | False      | 5000             | TCP port used by the API server.                       |
+--------------------+------------+------------------+--------------------------------------------------------+

Running the server
------------------
After you configure the server, you have to start the MongoDB instance that you
configured and afterwards you can launch the server itself using::

    $ python start.py

The server can be launched under both Python 2 and 3.

Creating users
---------------
Measurement data in Snailwatch is always associated with a user account.
Those can only be created using an admin authentication token that was
configured before the server launch. The API endpoint for creating users
is documented :api:`here <#/Admin/post_users>`.
You have to pass the admin token in the ``Authorization`` HTTP header.

Example request for creating a user using curl:

.. code-block:: bash

    $ curl -H "Content-Type: application/json" -H "Authorization: <admin-token>" \
    <server>/users -d '{"username": "user", "password": "12345"}'

You can also use the helper script ``server/scripts/createuser.py`` to create a
user:

.. code-block:: bash

    $ python scripts/createuser.py <server-address> <admin-token> <username> <password>

Once you create user accounts for your users, they can then login using the
:doc:`dashboard <dashboard>`.

Docker
------
We provide a docker image with the API server.

.. code-block:: bash

    $ docker pull kobzol/snailwatch:server

More information about the image can be found `here <https://hub.docker.com/r/kobzol/snailwatch>`_.
