import logging
import os

from engine.server import Server
from engine.service import LookupService

if __name__ == "__main__":
    redis_host = os.getenv("REDIS_HOST", "localhost")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_db = int(os.getenv("REDIS_DB", 0))
    redis_password = os.getenv("REDIS_PASSWORD", None)
    embeddings_path = os.getenv("EMBEDDINGS_PATH", "/data/embeddings.npy")
    entities_path = os.getenv("ENTITIES_PATH", "/data/entities.csv")
    engine_host = os.getenv("ENGINE_HOST", "")
    engine_port = int(os.getenv("ENGINE_PORT", 8000))

    logging.basicConfig(level=logging.INFO)
    service = LookupService(
        embeddings_path,
        entities_path,
        redis_host=redis_host,
        redis_port=redis_port,
        redis_db=redis_db,
        redis_password=redis_password,
    )
    service.load_data()

    server = Server(service)
    server.run(host=engine_host, port=engine_port)
