Measurement collection
======================
Measurements are grouped into projects that belong to a single user.
Before you can upload data to the server, you have to create a project and
generate an upload token for the project. You can do both either using the
web :doc:`dashboard <dashboard>` or using the REST :api:`API <>`.

For now let's assume you chose the latter. You can generate a session token
by logging in (documented :api:`here <#/Users/post_login>`).
You can generate as many session tokens as you want (for example one for manual
uploads, one for automated continuous integration uploads etc.).

Example curl request to login and create a session token:

.. code-block:: bash

    $ curl -H "Content-Type: application/json" <server>/login \
    -d '{"username": "user", "password": "12345"}'

This request will return a session token that you will use for subsequent
requests.

Projects can be created using :api:`this endpoint <#/Project/post_projects>`.

Example curl request to create a project:

.. code-block:: bash

    $ curl -H "Content-Type: application/json" -H "Authorization: <session-token>" \
    <server>/projects -d '{"name": "MyAwesomeProject"}'

You will get back a JSON object with the project's id which will be required
for creating an upload token.
The project id will be stored in a key named ``_id`` in the returned object.

After you are logged in and you know the id of your project, you can finally
generate an upload token for uploading the data.

.. code-block:: bash

    $ curl -H "Content-Type: application/json" -H "Authorization: <session-token>" \
    <server>/collectsessions -d '{"project": <project-id>}'

You will get back a JSON object. It's ``token`` key corresponds to the
generated upload_token.

After you have an upload token, you can upload measurements for
the given project. If you don't feel like creating HTTP requests manually,
you can use the helper scripts that we prepared (they are located in the
``server/scripts`` folder). For using the uploading API directly look
:api:`here <#/Measurement/post_measurements>`.

Example curl request to upload a measurement to a project:

.. code-block:: bash

    $ curl -H "Content-Type: application/json" -H "Authorization: <upload-token>" \
    <server>/measurements -d '{
        "benchmark": "MyFirstBenchmark",
        "environment": {
            "commit": "abcdef..."
        },
        "result": {
            "exec-time": {
                "type": "time",
                "value": "13.37"
            }
        }
    }'
