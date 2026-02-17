import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

class TestMLAPI:
    def setup_method(self):
        self.headers = {"Authorization": "Bearer test-secret"}
    
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_nlp_parse_endpoint(self):
        response = client.post(
            "/nlp/parse",
            json={"text": "I want to visit Paris for 5 days"},
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "destination" in data
        assert "days" in data
        assert "budget" in data
        assert "confidence" in data
    
    def test_nlp_parse_unauthorized(self):
        response = client.post(
            "/nlp/parse",
            json={"text": "I want to visit Paris for 5 days"}
        )
        assert response.status_code == 401
    
    def test_recommend_endpoint(self):
        request_data = {
            "user_id": "test_user",
            "preferences": {"budget": "medium", "interests": ["art"]},
            "destination": "Paris",
            "poi_candidates": [
                {
                    "place_id": "test_place",
                    "name": "Test Museum",
                    "category": ["museum"],
                    "tags": ["art", "culture"]
                }
            ]
        }
        
        response = client.post(
            "/recommend",
            json=request_data,
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if data:
            assert "place_id" in data[0]
            assert "score" in data[0]
    
    def test_optimize_endpoint(self):
        request_data = {
            "poi_list": [
                {"place_id": "place1", "name": "Place 1"},
                {"place_id": "place2", "name": "Place 2"}
            ],
            "start_location": {"lat": 48.8566, "lng": 2.3522},
            "daily_time_budget": 8,
            "days": 2,
            "distance_matrix": [
                [{"distance": 0, "duration": 0}, {"distance": 1000, "duration": 600}],
                [{"distance": 1000, "duration": 600}, {"distance": 0, "duration": 0}]
            ]
        }
        
        response = client.post(
            "/optimize",
            json=request_data,
            headers=self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "plan" in data
        assert isinstance(data["plan"], list)