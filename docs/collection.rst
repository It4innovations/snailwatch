Measurement collection
======================
Measurements are grouped into projects that belong to a single user. Therefore
before you can upload data to the server, you have to generate a session token
for your user account and create a project. You can do both either using the
web :doc:`dashboard <dashboard>` or using the REST :api:`API <>`.

For now let's assume you chose the latter. You can generate a session token
by logging in (documented :api:`here <#/Users/post_login>`).
You can generate as many session tokens as you want (for example one for manual
uploads, one for automated continuous integration uploads etc.).

Projects can be created using :api:`this endpoint <#/Project/post_projects>`.
After you create a project you will get back a JSON object with the project's
id, which will be required for uploading measurements.

After you get a session token and project id, you can upload measurements to
the given project. If you don't feel like creating HTTP requests manually,
you can use the helper scripts that we prepared (they are located in the
``collection`` folder). For using the uploading API directly look
:api:`here <#/Measurement/post_measurements>`.
