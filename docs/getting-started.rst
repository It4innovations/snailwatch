Getting started
===============
This guide shows reference API calls for creating a user, logging in,
creating a project and uploading your first measurement.

1. Create a user account. You can do it with our provided Python
:doc:`library <client>` or with :api:`this <#tag/User/paths/~1login/post>`
endpoint:

.. code-block:: bash

    $ curl -H "Content-Type: application/json" -h "Authorization: <admin-token>" <server>/users \
      -d '{"username": "user", "password": "12345"}'

.. note::
    Creating a user requires the Admin token, which is configured when deploying
    the app.

2. Log in to get a session token :api:`(endpoint) <#tag/User/paths/~1login/post>`:

.. code-block:: bash

    $ curl -H "Content-Type: application/json" <server>/login \
      -d '{"username": "user", "password": "12345"}'
    # { "id": "1234", "token": "abcdef" }

This request will return a session token that you have to put into the ``Authorization``
header for the request to create a project.

3. Create a project :api:`(endpoint) <#tag/Project/paths/~1projects/post>`:

.. code-block:: bash

    $ curl -H "Content-Type: application/json" -H "Authorization: <session-token>" \
      <server>/projects -d '{"name": "MyAwesomeProject"}'
    # { "name": "MyAwesomeProject", ..., "uploadToken": ... }

You will get back a JSON object with the project's upload token, which is needed
for uploading measurements.

4. Upload measurements :api:`(endpoint) <#tag/Measurement/paths/~1measurements/post>`.
You can also use the Python client to upload measurements (recommended):

.. code-block:: bash

    $ curl -H "Content-Type: application/json" -H "Authorization: <upload-token>" \
    <server>/measurements -d '{
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

.. note ::

    There are three types of tokens in Snailwatch:

    1. Admin token - configured when you deploy the app. Required for creating users.
    2. Session token - one per user login, required for all other API calls except measurement uploads.
    3. Upload token - one per each project, required for measurement uploads.
