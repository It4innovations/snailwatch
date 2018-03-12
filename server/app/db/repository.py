from bson import ObjectId


class Repository(object):
    def normalize_id(self, id):
        if not isinstance(id, ObjectId):
            return ObjectId(id)
        return id
