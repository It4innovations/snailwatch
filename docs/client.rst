Client
======
We provide a simple Python library called ``swclient`` that allows you to
create users, projects and upload measurements to Snailwatch.
You can either use it as a CLI tool or as a library directly in your code.

Installation
------------

``swclient`` is located in the ``python`` directory. If you just want to use it as a CLI tool,
it is enough to install its dependencies from the ``requirements.txt`` file:

.. code-block:: bash

    $ pip install -r requirements.txt


If you want to use it in your code as a library, we recommend to install `swclient`
(preferably in a `virtual environment <https://docs.python.org/3/library/venv.html>`_):

.. code-block:: bash

    $ python setup.py install


CLI usage
---------
The following examples assume that ``swclient`` is either installed or that
you launch the commands from the ``python`` subdirectory in the Snailwatch repository.

.. code-block:: bash

    # create user (email is optional)
    $ python -m python.swclient <server> create-user <admin-token> <username> --email <email>

    # create project (repository URL is optional)
    $ python -m swclient <server> create-project <session-token> name --repository <repository>

    # upload data directly
    $ python -m swclient <server> upload <upload-token> my-benchmark '{"commit":"abc"}' '{"result":{"type":"time","value":"15"}}'

    # upload data from a JSON file
    $ python -m swclient <server> upload-file <upload-token> benchmarks.json


Library usage
-------------

The designed way to use this library is from a script that is run by a CI service.
Your script may look something like this (simplified example that measures a single benchmark once):

.. code-block:: python

    import tests
    from swclient.client import Client
    import os

    time_a = tests.benchmark_a()

    client = Client(
        '<server>/api',
        <your-upload-token>
    )

    client.upload_measurements([(
        'BenchmarkA',       # benchmark name
        {                   # environment of the measurement
            'commit': os.environ['CI_COMMIT'],
            'branch': os.environ['CI_BRANCH'],
            'threads': '16'
        },
        {                   # measured results
            'executionTime': {
                'value': time_a,
                'type': 'time'
            }
        }
    )])

.. note::
    When uploading multiple measurements at once, always use the method
    `upload_measurements` instead of calling `upload_measurement` repeatedly.
    It saves both bandwidth and CPU usage of the server.


CLI documentation
-----------------

.. argparse::
   :module: swclient.cmd
   :func: create_parser
   :prog: python -m swclient


API documentation
---------------------

.. autoclass:: swclient.client.Client
    :members:
