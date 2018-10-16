Snailwatch
==========

Snailwatch is a service for continuously monitoring your app's performance.
It collects measured results of your benchmarks and allows you to see
historical overview of their performance in a web dashboard. When the performance
of any benchmark drops, it can automatically notify you with the details of the
regression.

.. figure:: pipeline.svg
    :width: 70%
    :alt: Snailwatch pipeline
    :align: center

    Snailwatch pipeline

Current features:
    - import of measurements
    - historical overview of app performance with multiple chart types
    - querying measurements using custom filters and aggregations
    - automatic regression detection and notification via e-mail


Planned features:
    - usage of statistical methods to improve regression detection accuracy (T-test)
    - integration with CI (Travis, Gitlab)
    - integration with performance measurement tools (Gatling, JMeter)


| To learn more about Snailwatch, read the :doc:`Overview <overview>`.
| Complete Snailwatch API documentation can be found :doc:`here <api>`.


.. toctree::
    :maxdepth: 2
    :caption: Usage guide:

    overview
    getting-started
    cookbook
    dashboard
    client
    api

.. toctree::
    :maxdepth: 2
    :caption: Deployment guide:

    deploy-overview
    server-deploy
    dashboard-deploy
