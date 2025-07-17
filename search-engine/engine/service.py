import logging

import numpy as np
import pandas as pd
import redis
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transliterate import translit


class PointOfInterest(BaseModel):
    id: str
    name: str
    description: str | None
    lon: float
    lat: float
    categories: set[str]
    opening_hours: str | None


class SearchResult(PointOfInterest):
    score: float
    distance: float
    similarity: float | None = None


class LookupService:
    ALPHA = 0.7

    def __init__(
        self,
        embeddings_path: str,
        entities_path: str,
        redis_host: str = "localhost",
        redis_port: int = 6379,
        redis_db: int = 0,
        redis_password: str | None = None,
    ):
        self.embeddings_path = embeddings_path
        self.entities_path = entities_path
        self.redis = redis.Redis(
            host=redis_host, port=redis_port, db=redis_db, password=redis_password
        )
        self.pois = {}
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        logging.info("Model loaded")

    def load_data(self):
        embeddings = np.load(self.embeddings_path)
        logging.info("Embeddings loaded successfuly")

        entities = pd.read_csv(self.entities_path, keep_default_na=False)
        self.pois = {
            entity["id"]: (
                embeddings[i],
                PointOfInterest(
                    id=entity["id"],
                    name=translit(entity["name"], language_code="uk", reversed=True),
                    description=translit(
                        entity["description"], language_code="uk", reversed=True
                    )
                    or None,
                    lon=entity["lon"],
                    lat=entity["lat"],
                    categories=set(entity["categories"].split("/")),
                    opening_hours=entity["opening_hours"] or None,
                ),
            )
            for i, entity in entities.iterrows()
        }
        logging.info("Entities loaded successfuly")

        self.redis.delete("entities")

        batch = []
        batch_size = 0
        for _, entity in self.pois.values():
            batch += (entity.lon, entity.lat, entity.id)
            batch_size += 1
            if batch_size == 1000:
                self.redis.geoadd("entities", batch)
                batch.clear()

        if batch:
            self.redis.geoadd("entities", batch)
        logging.info("Geoset successfuly loaded")

    def _geosearch(
        self, lat: float, lon: float, radius: float, categories: set | None = None
    ) -> list[tuple[float, np.ndarray, PointOfInterest]]:
        result = []

        for id, distance in self.redis.georadius(
            "entities", lon, lat, radius, unit="m", withdist=True, sort="ASC"
        ):
            id = id.decode("utf-8")
            embedding, poi = self.pois[id]

            if categories and not poi.categories.intersection(categories):
                continue

            result.append((distance, embedding, poi))

        return result

    @staticmethod
    def _compute_score(
        similarity: float | None, distance: float, radius: float
    ) -> float:
        distance = (radius - distance) / radius

        if similarity is None:
            return distance

        similarity = (similarity + 1) / 2
        return similarity * LookupService.ALPHA + distance * (1 - LookupService.ALPHA)

    def search(
        self,
        lat: float,
        lon: float,
        radius: float,
        categories: set | None = None,
        query: str | None = None,
    ) -> list[SearchResult]:
        query_embedding = query and self.model.encode(
            query, convert_to_numpy=True, show_progress_bar=False
        )

        result = []
        for distance, embedding, poi in self._geosearch(lat, lon, radius, categories):
            similarity = None
            if query_embedding is not None:
                similarity = self.model.similarity(query_embedding, embedding).item()

            result.append(
                SearchResult(
                    id=poi.id,
                    name=poi.name,
                    description=poi.description,
                    lon=poi.lon,
                    lat=poi.lat,
                    categories=poi.categories,
                    opening_hours=poi.opening_hours,
                    score=self._compute_score(similarity, distance, radius),
                    distance=distance,
                    similarity=similarity,
                )
            )

        result.sort(key=lambda poi: poi.score, reverse=True)

        logging.info(
            f"Search for request {lat}, {lon}, {radius} with "
            f"categories {categories!r} and query {query!r} "
            f"returned {len(result)} results"
        )

        return result
