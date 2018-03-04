import sys
import requests


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

    response = requests.post("{}/users".format(server), json=payload,
                             headers=hdr)
    data = response.content
    if response.status_code != 201:
        raise Exception('Error while creating user, '
                        'response status: {}, error: {}', response.status_code,
                        data)
    else:
        return response.json()


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

    user = create_user(server, token, username, password)
    print("User {} successfully created, id: {}".format(username, user["_id"]))
