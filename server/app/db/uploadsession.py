class UploadSessionRepo(object):
    def __init__(self, app):
        self.table = app.data.driver.db['uploadsessions']

    def find_session(self, token):
        return self.table.find_one({
            'token': token
        })

    def get_session_from_request(self, request):
        token = request.headers.get('Authorization', None)
        if not token:
            return None

        session = self.find_session(token)
        if not session:
            return None

        return session
