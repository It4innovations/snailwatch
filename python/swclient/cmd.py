import argparse
import getpass
import json
import dateutil.parser

from .session import Session


def parse_args():
    parser = argparse.ArgumentParser("swclient")
    parser.add_argument("server_url", help="Address of Snailwatch server")
    parser.add_argument("token", help="Security token")
    subparsers = parser.add_subparsers(title="action", dest="action")

    create_user_parser = subparsers.add_parser('create-user')
    create_user_parser.add_argument("username")

    create_user_parser = subparsers.add_parser('upload')
    create_user_parser.add_argument("benchmark")
    create_user_parser.add_argument("env")
    create_user_parser.add_argument("result")
    create_user_parser.add_argument("--timestamp")

    create_user_parser = subparsers.add_parser('upload-file')
    create_user_parser.add_argument("filename")

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
        timestamp = None
        if "timestamp" in data:
            timestamp = dateutil.parser.parse(data.timestamp)

        session.upload_measurement(data["benchmark"],
                                   data["environment"],
                                   data["result"],
                                   timestamp)
    else:
        print("Enter a valid subcommand (create-user, upload or upload-file)")
