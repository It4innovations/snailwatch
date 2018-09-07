Getting started
===============
This guide shows reference API calls for logging in, creating a project, getting its upload token and uploading
a measurement. This assumes that you already have a user account
(see the :doc:`Overview <overview>` on how to create one).

If you don't want to manually create HTTP requests, you can use our provided Python :doc:`library <client>`.

1. Log in and get a session token :api:`(endpoint) <#tag/User/paths/~1login/post>`:

.. code-block:: bash

    $ curl -H "Content-Type: application/json" <server>/login \
      -d '{"username": "user", "password": "12345"}'
    # { "id": "1234", "token": "abcdef" }

This request will return a session token that you have to put into the ``Authorization`` header for subsequent
requests.

2. Create a project :api:`(endpoint) <#tag/Project/paths/~1projects/post>`:

.. code-block:: bash

    $ curl -H "Content-Type: application/json" -H "Authorization: <session-token>" \
      <server>/projects -d '{"name": "MyAwesomeProject"}'
    # { "name": "MyAwesomeProject", ..., "_id": "5b90d743e540cd399e5e1a6a" }

You will get back a JSON object with the project's id which will be required
for creating an upload token.
The project id will be stored in a key named ``_id`` in the returned object.

3. Get the project upload token :api:`(endpoint) <#tag/Project/paths/~1get-upload-token~1{project-id}/get>`:

.. code-block:: bash

    $ curl -H "Content-Type: application/json" -H "Authorization: <session-token>" \
    <server>/get-upload-token/<project-id>

You will get back a JSON string containing the upload token. After you have an upload token, you can start
uploading measurements to the given project.

4. Upload measurements :api:`(endpoint) <#tag/Measurement/paths/~1measurements/post>`:

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
