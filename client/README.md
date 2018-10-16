# Snailwatch client
This is a helper Python library that enables you to quickly
create new users, projects and upload measurements to Snailwatch.

You can use it either as a CLI tool or as a Python library in your scripts.

You can find the client documentation [here](https://snailwatch.readthedocs.io/en/latest/client.html).

## Installation
```bash
$ python setup.py install
```

## CLI usage
```bash
# create user (email is optional)
$ python -m python.swclient <server> create-user <admin-token> <username> --email <email>

# create project (repository URL is optional)
$ python -m swclient <server> create-project <session-token> name --repository <repository>

# upload data directly
$ python -m swclient <server> upload <upload-token> my-benchmark '{"commit":"abc"}' '{"result":{"type":"time","value":"15"}}'

# upload data from a JSON file
$ python -m swclient <server> upload-file <upload-token> benchmarks.json
```


## Library usage
```python
import os
import tests

from swclient.client import Client

time_a = tests.benchmark_a()

client = Client(
    '<server>',
    <your-upload-token>
)

client.upload_measurements([(
    'BenchmarkA',       # benchmark name
    {                   # environment of the measurement
        'commit': os.environ['CI_COMMIT'],
        'branch': os.environ['CI_BRANCH'],
        'threads': '16'
    },
    {                   # measured results
        'executionTime': {
            'value': time_a,
            'type': 'time'
        }
    }
)])
```
