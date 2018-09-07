Overview
========
Snailwatch is a service that consists of a MongoDB database, a Flask server with REST API and a React
dashboard. You upload measured results of your performance tests (benchmarks) using the API and the data then appears
in the dashboard.

To start using Snailwatch, you first have to :doc:`deploy it <deploy-overview>`.

After it's deployed, you have to create a user account to use it.
You can do that using :api:`this <#tag/User/paths/~1users/post>` API endpoint.

With a user account, you can create a project and read it's upload token.
You can do both either using the dashboard or with the API. A project roughly
corresponds to a single repository, but you may also have multiple repositories
belonging to a single project. You can create a project in the dashboard
or using :api:`this endpoint <#tag/Project/paths/~1projects/post>`.

The final component required for uploading measurements is an upload token.
The token is displayed in the Project section of the dashboard, but you can
also read it programatically
:api:`here <#tag/Project/paths/~1get-upload-token~1{project-id}/get>` or by
fetching a project from the API.

With the upload token you can start to upload measurements. The recommended way of
automatically uploading benchmark results is to use a CI service such as `Travis <https://travis-ci.org/>`_ or
`GitLab <https://gitlab.com>`_.

In a typical usage scenario, after every new commit is pushed to your repository, the CI service will run a script
that launches your performance tests and uploads the results to Snailwatch. We provide a small Python library to ease the
measurement uploads. You can see its usage :doc:`here <client>`.

.. note ::

    There are three types of tokens in Snailwatch:

    1. Admin token - configured when you deploy the app. Required for creating users.
    2. Session token - one per user login, required for all other API calls except measurement uploads.
    3. Upload token - one per each project, required for measurement uploads.

In the :doc:`Getting started <getting-started>` guide you can find a complete API workflow that uploads a measurement
to Snailwatch.
