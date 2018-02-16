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
| SW_ADMIN_TOKEN     | True       |(generated) [#t]_ | Authentication token used for administrative actions.  |
+--------------------+------------+------------------+--------------------------------------------------------+
| SW_MONGO_HOST      | True       | localhost        | Address of MongoDB server.                             |
+--------------------+------------+------------------+--------------------------------------------------------+
| SW_MONGO_PORT      | True       | 27017            | Port of MongoDB server.                                |
+--------------------+------------+------------------+--------------------------------------------------------+
| SW_MONGO_DB        | True       | snailwatch       | Name of MongoDB database.                              |
+--------------------+------------+------------------+--------------------------------------------------------+
| SW_MONGO_USERNAME  | False      |                  | Auth username for MongoDB server.                      |
+--------------------+------------+------------------+--------------------------------------------------------+
| SW_MONGO_PASSWORD  | False      |                  | Auth password for MongoDB server.                      |
+--------------------+------------+------------------+--------------------------------------------------------+

.. [#t] If you don't specify the admin token, a random one will be generated and printed to the standard output during server startup.

Running the server
------------------
After you configure the server, you have to start the MongoDB instance that you
configured and afterwards you can launch the server itself using::

    $ python server/start.py

The server can be launched under both Python 2 and 3.

.. note::
    The server starts by default on ``localhost:5000``, you can modify this
    by setting host and port in the configuration.json (TODO).

Creating users
---------------
Measurement data in Snailwatch is always associated with a user account.
Those can only be created using an admin authentication token that was
configured before the server launch. The API endpoint for creating users
is documented :api:`here <#/Admin/post_users>`.
You have to pass the admin token in the ``Authorization`` HTTP header.

Once you create user accounts for your users, they can then login using the
:doc:`dashboard <dashboard>`.
