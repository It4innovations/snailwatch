import argparse
import getpass
import json
import dateutil.parser

from .session import Session


def parse_args():
    parser = argparse.ArgumentParser("swclient")
    parser.add_argument("server_url", help="Address of Snailwatch server")
    subparsers = parser.add_subparsers(title="action", dest="action")

    create_user_parser = subparsers.add_parser('create-user')
    create_user_parser.add_argument(
        "token", help="Admin token(required for creating users)")
    create_user_parser.add_argument("username")

    upload_parser = subparsers.add_parser('upload')
    upload_parser.add_argument("token", help="Upload token")
    upload_parser.add_argument("benchmark")
    upload_parser.add_argument("env")
    upload_parser.add_argument("result")
    upload_parser.add_argument("--timestamp")

    upload_file_parser = subparsers.add_parser('upload-file')
    upload_file_parser.add_argument("token", help="Upload token")
    upload_file_parser.add_argument("filename")

    return parser.parse_args()


def main():
    args = parse_args()

    session = Session(args.server_url, args.token)

    if args.action == "create-user":
        password = getpass.getpass()
        session.create_user(args.username, password)
    elif args.action == "upload":
        timestamp = None
        if args.timestamp:
            timestamp = dateutil.parser.parse(args.timestamp)
        session.upload_measurement(args.benchmark,
                                   json.loads(args.env),
                                   json.loads(args.result),
                                   timestamp)
    elif args.action == "upload-file":
        with open(args.filename) as f:
            data = json.load(f)

        if not isinstance(data, list):
            data = [data]
        measurements = []

        for item in data:
            timestamp = None
            if "timestamp" in item:
                timestamp = dateutil.parser.parse(item["timestamp"])
            measurements.append((
                item["benchmark"],
                item["environment"],
                item["result"],
                timestamp
            ))

        session.upload_measurements(measurements)
    else:
        print("Enter a valid subcommand (create-user, upload or upload-file)")
