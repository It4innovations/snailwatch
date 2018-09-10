Overview
========
Snailwatch is a service that consists of a MongoDB database, a Flask server with REST API and a React
dashboard. You upload measured results of your performance tests (benchmarks) using the API and the data then appears
in the dashboard.

To start using Snailwatch, you first have to :doc:`deploy it <deploy-overview>`.
In the :doc:`Getting started <getting-started>` guide you can find a complete
API workflow that uploads a measurement to Snailwatch.

To use Snailwatch, first you have to create a user account. With it you can
create new projects. A project roughly corresponds to a single repository,
but you may also have multiple repositories belonging to a single project.

With a project, you can start uploading measurements. It's up to you how and when
you upload performance data to Snailwatch. A typical use case would be to use a
CI service such as `Travis <https://travis-ci.org/>`_ or
`GitLab <https://gitlab.com>`_ and run your performance tests after each commit.
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

The **benchmark** field is used in the dashboard to categorize the measurements.
Because of that it should not be overly specific, i.e. `BenchmarkA` is a valid name,
`BenchmarkA-master-8cpus-large_dataset` not so much.

This kind of data belongs to the **environment**, which describes parameters of
the benchmarked code and the benchmark itself.
It can contain e.g. the version of code (branch, commit ID), scaling parameters
(number of CPUs, threads, nodes) or input data size. It is used to filter the
measurements in the dashboard.

The last (and most important) part of the measurement is the measured **result**.
It is a dictionary where each key represents a single measured entity.
Typically you want to measure execution time, but you can also record other data,
for example memory working set size or average latency. In addition to the value
of the result, you also have to specify its *type*. It can be one of these values:
``"time", "size", "integer", "string"``. Right now the type is not used, but it
may be useful in the future for different visualizations of various result types.

You can find the full schema of measurements in the
:api:`API documentation <#tag/Measurement/paths/~1measurements/post>`.
