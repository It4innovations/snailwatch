Dashboard deployment
====================
Installation
------------
You can install dependencies of the dashboard using npm::

    $ cd dashboard
    $ npm install

Configuration
-------------
Before launching the dashboard, you have to provide address of the API server.
It is passed through an environment variable:

+----------------+------------+-----------------------+-------------------------------------+
| Name           | Required   | Default               | Description                         |
+================+============+=======================+=====================================+
| API_SERVER     | True       | http://localhost:5000 | Address of the Snailwatch server.   |
+----------------+------------+-----------------------+-------------------------------------+

Starting the dashboard
----------------------
After you fill in the configuration you can build it and then serve it
from the ``build`` directory::

    $ npm run build
    $ SW_API_SERVER=http://localhost:5000 node build/server.js

Docker
------
We provide a docker image with the dashboard. ::

    $ docker pull kobzol/snailwatch:dashboard

More information about the image can be found `here <https://hub.docker.com/r/kobzol/snailwatch>`_.
