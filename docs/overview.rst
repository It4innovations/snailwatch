Overview
========
Snailwatch is a self-hosted service that consists of a MongoDB database, a Flask REST API and a React
dashboard. To start using Snailwatch, you first have to :doc:`deploy it <deploy-overview>`.
In the :doc:`Getting started <getting-started>` guide you can find a complete
workflow that walks you through the process of creating a user and uploading measurements to Snailwatch.

.. note::
    Snailwatch is not hosted anywhere publicly - you have to deploy it yourself to use it.

Snailwatch has user authentication, but there is no register functionality, so accounts
have to be created manually from the backend. Every user can create projects,
which roughly correspond to a single repository. When you upload measurements
to Snailwatch, you have to specify to which project they belong.

It's up to you how and when you upload your performance measurements to Snailwatch.
A typical use case would be to use a CI service such as `Travis <https://travis-ci.org/>`_
or `GitLab <https://gitlab.com>`_ and run your performance tests after each commit.
You can then either use our Python :doc:`client <client>` or the :doc:`API <api>` directly
to upload the results to Snailwatch.

A measurement represents the result of a benchmark that is run against your code.
Here's an example measurement that Snailwatch expects:

.. code-block:: javascript

    {
        benchmark: "MyFirstBenchmark",
        environment: {
            commit: "abcdef",
            branch: "master",
            cpus: 8
        },
        result: {
            runtime: {
                type: "time",
                value: "13.37"
            }
        }
    }

The **benchmark** field is used to categorize the measurements in the dashboard.
It should not be overly specific, i.e. `BenchmarkA` is a
reasonable benchmark name, `BenchmarkA-master-8cpus-large_dataset` not so much.

Specific data that describe the parameters of the benchmark and the code belong to
the **environment** field.
It can contain e.g. the version of code (branch, commit ID), scaling parameters
(number of CPUs, threads, nodes) or input data size. Environment can be used to
query and aggregate the measurements in the dashboard.

The last (and most important) part of the measurement is the measured **result**.
It is a dictionary where each key represents a single measured entity.
Typically you want to measure execution time, but you can also record other data,
for example memory working set size or average latency. In addition to the value
of the result, you also have to specify its *type*. It can be one of these values:
``"time", "size", "integer", "string"``.

.. note::
    Right now the result type is not used, but it
    may be useful in the future for different visualizations of various result types.

You can find the full schema of measurements in the
:api:`API documentation <#tag/Measurement/paths/~1measurements/post>`.
