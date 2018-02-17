Dashboard deployment
====================
Installation
------------
You can install dependencies of the dashboard using npm::

    $ cd dashboard
    $ npm install

Configuration
-------------
Before launching the dashboard, you have to provide address of the server.
It is passed through an environment variable:

+----------------+------------+-----------------------+-------------------------------------+
| Name           | Required   | Default               | Description                         |
+================+============+=======================+=====================================+
| SW_API_SERVER  | True       | http://localhost:5000 | Address of the Snailwatch server.   |
+----------------+------------+-----------------------+-------------------------------------+

Starting the dashboard
----------------------
After you fill in the configuration, you can start the dashboard in development mode::

    $ SW_API_SERVER=... npm run start

or you can build it in production mode and then serve it from the ``build`` directory::

    $ SW_API_SERVER=... npm run build
