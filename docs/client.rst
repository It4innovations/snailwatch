Client
======
We provide a simple Python library that allows you to create a user and upload measurements.
You can either use it as a CLI tool or as a library directly in your code.

It is located in the ``python`` directory.

Example CLI usage:

.. code-block:: bash

    # uploading data directly
    $ python -m swclient <server> upload 'my-benchmark' '{"commit": "abc"}' '{"result": {"type": "time", "value": "15"}}'

    # uploading data from a JSON file
    $ python -m swclient <server> upload-file benchmarks.json

The most common way to use this library is from a script that is run by a CI service.
Your script may look something like this (simplified example that measures each benchmark only once):

.. code-block:: python

    import tests
    import swclient
    import os

    time_a = tests.benchmark_a()

    session = Session(
        '<server>/api',
        <your-upload-token>
    )

    session.upload_measurement(
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
    )
