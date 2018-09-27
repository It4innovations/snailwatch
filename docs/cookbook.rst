Cookbook
========
This cookbook contains short examples of various useful tasks that can be used
in Snailwatch.

Multi-stage measurements
------------------------
Benchmarked code sometimes consists of smaller parts (stages) that have different
performance characteristics (initialization, main computation, postprocessing, etc.).
In that case, it may be interesting to observe not only the total execution time,
but also the ratios of the individual stages.
Large changes in those ratios may mark a bug in the code, which can be obscured if
the total execution time stays the same.

To achieve this in Snailwatch, simply include each stage as a separate result
key in the measurement:

.. code-block:: python

    client.upload_measurement("MyBenchmark", {
        "commit": "abc"
    }, {
        "init": {"value": 105, "type": "time"},
        "exec": {"value": 1287, "type": "time"},
        "postprocess": {"value": 413, "type": "time", }
    })


The ratios can be visualized clearly in a bar chart, which you can
find in the dashboard on the *Stacked bar chart* |bar| subpage.
If you then select a view containing all of the stages selected as Y axes,
you should see a chart similar to the image below.

.. figure:: stacked-bar-chart.svg
    :width: 60%
    :height: 200
    :alt: Stacked bar chart displaying ratios of individual computation stages
    :align: center

    Stacked bar chart displaying ratios of individual computation stages

.. |bar| image:: icon-bar-chart.svg
    :width: 20px
