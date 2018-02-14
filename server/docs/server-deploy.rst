Server deployment
=================
Installation
------------
You can install the dependencies of the server with pip (you have to be in the
``server`` directory)::

    $ pip install -r requirements.txt

Configuration
-------------
Before you can upload and visualise the data, you first have to configure
and launch the server. It is a Flask application that uses MongoDB for data
storage. Before launching the server you have to provide some basic
configuration in a JSON file located at ``server/configuration.json``.
You can set the following properties:

+----------------+------------+-----------------------------------------------+
| Name           | Required   | Description                                   |
+================+============+===============================================+
| adminAuthToken | True       | Authentication token used for admin actions.  |
+----------------+------------+-----------------------------------------------+
| mongoHost      | True       | Address of MongoDB server.                    |
+----------------+------------+-----------------------------------------------+
| mongoPort      | True       | Port of MongoDB server.                       |
+----------------+------------+-----------------------------------------------+
| mongoDB        | True       | Name of MongoDB database.                     |
+----------------+------------+-----------------------------------------------+
| mongoUsername  | False      | Auth username for MongoDB server.             |
+----------------+------------+-----------------------------------------------+
| mongoPassword  | False      | Auth password for MongoDB server.             |
+----------------+------------+-----------------------------------------------+

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
