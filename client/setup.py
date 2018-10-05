from setuptools import setup, find_packages

with open('requirements.txt') as reqs:
    requirements = [line for line in reqs.read().split('\n') if line]

setup(
    name='snailwatch client',
    version='0.1',
    description='Snailwatch client for uploading measurements',
    author='Jakub Beránek, Stanislav Bohm',
    author_email='jakub.beranek.st@vsb.cz',
    url='https://snailwatch.readthedocs.io',
    license='MIT',
    packages=find_packages(),
    install_requires=requirements
)
