import logging
import time

from bottle import Bottle, request, response, run

from engine.service import LookupService


class Server:
    VERSION = "1.0.0"

    def __init__(self, service: LookupService):
        self.service = service
        self.app = Bottle()
        self.app.route("/search", callback=self.search)

    def search(self):
        start = time.time()

        data = self._search()

        end = time.time()

        logging.info(f"Request processed in {end - start:.2f} seconds")

        response.headers["X-Triply-Engine-Version"] = self.VERSION
        response.headers["X-Triply-Processing-Time"] = str(end - start)

        return data

    def _search(self):
        if not request.query.lat or not request.query.lon or not request.query.radius:
            response.status = 400
            return {
                "status": "invalid_request",
                "error": "Missing required parameters: lat, lon, radius",
            }

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

        results = self.service.search(lat, lon, radius, categories, query)
        results = results[offset : offset + limit] if limit else results[offset:]

        response.content_type = "application/json"
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
