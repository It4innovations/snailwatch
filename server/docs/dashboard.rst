Dashboard
=========
Installation
------------
You can install dependencies of the dashboard using npm (you have to be in the
``dashboard`` directory)::

    $ npm install

Configuration
-------------
Before launching the dashboard, you have to provide
configuration in a JSON file located at ``dashboard/src/configuration.json``.
You can set the following properties:

+----------------+------------+-----------------------------------------------+
| Name           | Required   | Description                                   |
+================+============+===============================================+
| apiServer      | True       | Address of the Snailwatch server.             |
+----------------+------------+-----------------------------------------------+

Starting the dashboard
----------------------
After you fill in the configuration, you have to install dependencies and then
you canstart the dashboard (you have to be in in the directory ``dashboard``)::

    $ npm run start

