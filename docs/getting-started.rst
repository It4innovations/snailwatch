Getting started
===============
This guide will walk you through the basic usage of Snailwatch, from creating a user to
observing performance measurements in the dashboard . It assumes that
Snailwatch is already deployed (if it's not, learn how to do that :doc:`here <deploy-overview>`).

We will use our provided Python :doc:`client <client>` in this guide, so first make sure
that its dependencies are installed. If you want
to use raw API calls instead, please check the curl examples `below <#example-api-calls>`_.

The following commands/scripts assume that ``swclient`` is either installed or that
you launch them from the ``client`` subdirectory in the Snailwatch repository.

Create a user
-------------
The first thing that we have to do is to create a user account.
Run the following script to create a user named *snail*:

.. code-block:: bash

    $ python -m swclient http://localhost:5000 create-user <admin-token> snail

After you run this command, you will be prompted to enter a password for the user.
For convenience, `swclient` will also directly log you in and
display the session token. You should see something like this printed on the standard output:

.. code-block:: bash

    Created user snail, session token: <session-token>

.. note::
    Creating a user requires the Admin token, which is configured when deploying
    the app. There are three types of tokens in Snailwatch:

    1. Admin token - configured when you deploy the app. Required for creating users.
    2. Session token - one per user login, required for all other API calls except measurement uploads.
    3. Upload token - one per each project, required for measurement uploads.


Create a project
----------------
Next run the client again to create a project:

.. code-block:: bash

    $ python -m swclient http://localhost:5000 create-project <session-token> killerapp \
      --repository https://github.com/killerapp/killerapp

If the project was created successfully, you should see this on the standard output:

.. code-block:: bash

    Created project killerapp, upload token: <upload-token>

The upload token allows you to upload measurements to Snailwatch and thus it should be
kept secret. It can be displayed on the Project page in the dashboard, where you can also
revoke it if the token becomes compromised.

.. note::
    The repository URL argument is optional. If you specify it, Snailwatch will be able to
    generate direct links to individual commits from the dashboard (supports GitHub and GitLab repository URLs).


Upload measurements
-------------------
Now that we have an upload token available, we can start generating measurement data.
This part is not handled by Snailwatch, you have to measure what you want on your own.
Below is a short example that measures an artifical Python function
and sends the result to Snailwatch. The function is measured several times with
different commit IDs to add variability to the results and generate some data to look at
(a lone point in a chart wouldn't be very interesting). Run this script to upload the
data to Snailwatch:

.. code-block:: python

    from swclient.client import Client
    import random
    import time


    def measured():
        time.sleep(0.2 + (random.random() * 0.1))  # simulate variable work


    def measure():
        start = time.time()
        measured()
        return (time.time() - start) * 1000  # time in ms


    def upload(commit, elapsed):
        client = Client('http://localhost:5000',
                        <upload-token>)
        client.upload_measurement(
            "FnBenchmark",  # benchmark name
            {
                "commit": commit  # environment of the measurement
            },
            {
                "elapsed": {  # measured data
                    "type": "time",
                    "value": elapsed
                }
            }
        )


    for commit in range(4):
        for measurement in range(5):
            upload("abc{}".format(commit), measure())


Congratulations! You've just uploaded your first measurement to Snailwatch.
Now you can go to the dashboard URL (by default http://localhost:3000 if you deployed
Snailwatch locally) and take a look at the data.

.. note::
    The ``time.time`` function is not ideal for benchmarking code in Python, because it
    measures wall clock time. It is only used in this example for simplicity.
    To benchmark Python code properly, you should use other functions, for example
    ``time.clock``.

Example API calls
-----------------
Create a user (:api:`endpoint <#tag/Admin/paths/~1users/post>`)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
.. code-block:: bash

    $ curl -H "Content-Type: application/json" -h "Authorization: <admin-token>" http://localhost:5000/users \
      -d '{"username": "user", "password": "12345"}'

Log in (:api:`endpoint <#tag/User/paths/~1login/post>`)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
.. code-block:: bash

    $ curl -H "Content-Type: application/json" http://localhost:5000/login \
      -d '{"username": "user", "password": "12345"}'
    # { "_id": "1234", ..., "token": "abcdef" }

This request will return a session token that you have to put into the ``Authorization``
header for the request to create a project.

Create a project (:api:`endpoint <#tag/Project/paths/~1projects/post>`)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
.. code-block:: bash

    $ curl -H "Content-Type: application/json" -H "Authorization: <session-token>" \
      http://localhost:5000/projects -d '{"name": "MyAwesomeProject"}'
    # { "name": "MyAwesomeProject", ..., "uploadToken": ... }

You will get back a JSON object with the project's upload token, which is needed
for uploading measurements.

Upload measurements (:api:`endpoint <#tag/Measurement/paths/~1measurements/post>`)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
.. code-block:: bash

    $ curl -H "Content-Type: application/json" -H "Authorization: <upload-token>" \
    http://localhost:5000/measurements -d '{
        "benchmark": "MyFirstBenchmark",
        "environment": {
            "commit": "abcdef"
        },
        "result": {
            "runtime": {
                "type": "time",
                "value": "13.37"
            }
        }
    }'
