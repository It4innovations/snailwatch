Overview
========
Motivation
----------
Many programmers nowadays use unit (integration, acceptance etc.) tests to check
whether their code is working properly. To automate this process, those tests
are being executed in continuous integration pipelines with services like Travis, Jenking
or Gitlab CI. When a test fails, the programmer is instantly reminded to fix the code.

This is a very useful and working paradigm for correctness tests, but how about performance tests?
To understand and improve your code's performance, you first have to measure it.
But running a benchmark only tells you **how fast is your code right now**.
If your program is constantly evolving and you care about its performance, you should **monitor
it continously** to spot potential regressions that can often arise even from very subtle changes in the code.

The straightforward way to continuously monitor your code's performance
is to use the same method as unit tests and just run your benchmarks in the CI pipeline.
However there is a slight problem - how do you recognize a regression? In unit tests,
you assert that the result has the expected value, but you can't do that with benchmarks,
because their results often vary wildly. You may set an upper bound to catch regressions,
but it will probably have to be quite high to deal with outliers, which may defeat the purpose.
It also won't tell you whether the performance is improving over time or not.

This is where **Snailwatch** comes in. It acts as a database for your benchmark results
(typically gathered from executing them in a CI pipeline). It calculates statistics
about the measured data and if it finds a statistically significant regression, it will
automatically notify you. It also offers a useful dashboard that shows you the trend of
your code's performance over time.


How it works
------------
Snailwatch is a self-hosted service that consists of a MongoDB database, a Flask REST API and a React
dashboard. To start using Snailwatch, you first have to :doc:`deploy it <deploy-overview>`.
In the :doc:`Getting started <getting-started>` guide you can find a complete
workflow that walks you through the process of creating a user and uploading measurements to Snailwatch.

.. note::
    Snailwatch is not hosted anywhere publicly - you have to deploy it yourself to use it.

Snailwatch has user authentication, but there is no register functionality (yet),
so accounts have to be created manually from the backend. Every user can create projects,
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
