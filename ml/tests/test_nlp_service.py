import pytest
from src.services.nlp_service import NLPService

class TestNLPService:
    def setup_method(self):
        self.nlp_service = NLPService()
    
    def test_parse_simple_request(self):
        text = "I want to visit Paris for 5 days with a budget of 2000 euros"
        result = self.nlp_service.parse_travel_request(text)
        
        assert result.destination.lower() == "paris"
        assert result.days == 5
        assert result.budget == 2000.0
        assert result.confidence.destination > 0.5
    
    def test_parse_with_interests(self):
        text = "Trip to Tokyo for 3 days, love art and food, budget $1500"
        result = self.nlp_service.parse_travel_request(text)
        
        assert "tokyo" in result.destination.lower()
        assert result.days == 3
        assert result.budget == 1500.0
        assert "art" in result.interests
        assert "food" in result.interests
    
    def test_parse_minimal_request(self):
        text = "London trip"
        result = self.nlp_service.parse_travel_request(text)
        
        assert "london" in result.destination.lower()
        assert result.days >= 1  # Should have default
        assert result.budget > 0  # Should have default
    
    def test_parse_empty_request(self):
        text = ""
        result = self.nlp_service.parse_travel_request(text)
        
        # Should return defaults
        assert result.destination == ""
        assert result.days == 3
        assert result.budget == 1000.0