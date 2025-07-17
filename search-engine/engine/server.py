import logging
import time

from bottle import Bottle, request, response, run

from engine.service import LookupService, SortBy


class Server:
    VERSION = "1.0.0"

    def __init__(self, service: LookupService):
        self.service = service
        self.app = Bottle()
        self.app.route("/search", callback=self.wrap(self.search))
        self.app.route("/place", callback=self.wrap(self.get_place))

    def wrap(self, handler):
        def wrapped(*args, **kwargs):
            start = time.time()
            response_data = handler(*args, **kwargs)
            end = time.time()

            logging.info(f"Request processed in {(end - start)*1000:.0f} ms")

            response.content_type = "application/json"
            response.headers["X-Triply-Engine-Version"] = self.VERSION
            response.headers["X-Triply-Processing-Time"] = str(
                int((end - start) * 1000)
            )
            response.headers["Access-Control-Allow-Origin"] = "*"

            return response_data

        return wrapped

    def get_place(self):
        if not request.query.id:
            response.status = 400
            return {
                "status": "invalid_request",
                "error": "Missing required parameter: id",
            }

        poi = self.service.get_place(request.query.id)
        if poi is None:
            response.status = 404
            return {
                "status": "not_found",
                "error": "Point of Interest not found",
            }

        return {
            "status": "ok",
            "point": poi.model_dump(mode="json", exclude_none=True),
        }

    def search(self):
        if not request.query.lat or not request.query.lon or not request.query.radius:
            response.status = 400
            return {
                "status": "invalid_request",
                "error": "Missing required parameters: lat, lon, radius",
            }

        try:
            lat = float(request.query.lat)
            lon = float(request.query.lon)
            radius = float(request.query.radius)
            categories = (
                set(request.query.categories.split(","))
                if request.query.categories
                else None
            )
            offset = int(request.query.offset or 0)
            limit = request.query.limit and int(request.query.limit)
            query = request.query.q or None
            sort_by = request.query.sort_by and SortBy(request.query.sort_by)
        except ValueError:
            response.status = 400
            return {
                "status": "invalid_request",
                "error": "Invalid parameters format, check documentation",
            }

        if sort_by == SortBy.SIMILARITY and query is None:
            response.status = 400
            return {
                "status": "invalid_request",
                "error": "Cannot sort by similarity without a query",
            }

        results = self.service.search(lat, lon, radius, categories, query, sort_by)
        results = results[offset : offset + limit] if limit else results[offset:]

        return {
            "status": "ok",
            "points": [
                poi.model_dump(mode="json", exclude_none=True) for poi in results
            ],
        }

    def run(self, host: str = "", port: int = 8000, server: str = "wsgiref"):
        run(self.app, host=host, port=port, server=server)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    service = LookupService("embeddings.npy", "entities.csv")
    service.load_data()

    server = Server(service)
    server.run(host="127.0.0.1", port=8000)
