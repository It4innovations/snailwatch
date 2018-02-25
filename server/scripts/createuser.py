import json
import sys

py2 = sys.version_info[0] < 3

if py2:
    import httplib
else:
    import http.client as httplib


def create_user(server, admin_token, username, password):
    """
    Creates a user on the server.
    :param server: Address of the Snailwatch server (e.g. localhost:5000)
    :param admin_token: Admin token
    :param username: Username
    :param password: Password
    """
    payload = {
        'username': username,
        'password': password
    }

    hdr = {
        'Content-Type': 'application/json',
        'Authorization': admin_token
    }

    conn = httplib.HTTPConnection(server)
    conn.request('POST', '/users', json.dumps(payload), hdr)
    response = conn.getresponse()
    data = response.read()
    if response.status != 201:
        raise Exception('Error while creating user, '
                        'response status: {}, error: {}', response.status,
                        data)


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage:")
        print("python createuser.py <server-address> <admin-token> "
              "<username> <password>")
        exit(1)

    server = sys.argv[1]
    token = sys.argv[2]
    username = sys.argv[3]
    password = sys.argv[4]

    create_user(server, token, username, password)
    print("User {} successfully created".format(username))
