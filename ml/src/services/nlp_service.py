import spacy
import re
from typing import Dict, List
from ..models import NLPParseResponse, ConfidenceScores

class NLPService:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Fallback if model not available
            print("Warning: spaCy model not found, using basic parsing")
            self.nlp = None
    
    def parse_travel_request(self, text: str) -> NLPParseResponse:
        """
        Parse natural language travel request using spaCy NER and regex patterns.
        """
        # Initialize default values
        destination = ""
        days = 3
        budget = 1000.0
        interests = []
        
        # Confidence scores
        dest_confidence = 0.0
        days_confidence = 0.0
        budget_confidence = 0.0
        
        text_lower = text.lower()
        
        # Extract destination using spaCy NER if available
        if self.nlp:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ in ["GPE", "LOC"]:  # Geopolitical entity or location
                    destination = ent.text
                    dest_confidence = 0.9
                    break
        
        # Fallback destination extraction using common patterns
        if not destination:
            dest_patterns = [
                r"(?:visit|go to|travel to|trip to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)",
                r"in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)",
                r"to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)"
            ]
            
            for pattern in dest_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    destination = match.group(1)
                    dest_confidence = 0.7
                    break
        
        # Extract duration/days
        days_patterns = [
            r"(\d+)\s*days?",
            r"for\s+(\d+)\s*days?",
            r"(\d+)\s*day\s+trip",
            r"(\d+)d",
            r"week" # Convert week to 7 days
        ]
        
        for pattern in days_patterns:
            match = re.search(pattern, text_lower)
            if match:
                if "week" in pattern:
                    days = 7
                else:
                    days = int(match.group(1))
                days_confidence = 0.9
                break
        
        # Extract budget
        budget_patterns = [
            r"budget\s+(?:of\s+)?[\$€£]?(\d+(?:,\d{3})*(?:\.\d{2})?)",
            r"[\$€£](\d+(?:,\d{3})*(?:\.\d{2})?)\s*budget",
            r"spend\s+[\$€£]?(\d+(?:,\d{3})*(?:\.\d{2})?)",
            r"[\$€£](\d+(?:,\d{3})*(?:\.\d{2})?)"
        ]
        
        for pattern in budget_patterns:
            match = re.search(pattern, text_lower)
            if match:
                budget_str = match.group(1).replace(",", "")
                budget = float(budget_str)
                budget_confidence = 0.8
                break
        
        # Extract interests
        interest_keywords = {
            "art": ["art", "museum", "gallery", "painting", "sculpture"],
            "food": ["food", "restaurant", "cuisine", "dining", "culinary", "eat"],
            "history": ["history", "historical", "heritage", "ancient", "castle"],
            "nature": ["nature", "park", "hiking", "outdoor", "wildlife", "beach"],
            "culture": ["culture", "cultural", "tradition", "local", "festival"],
            "nightlife": ["nightlife", "bar", "club", "entertainment", "party"],
            "shopping": ["shopping", "market", "boutique", "mall", "souvenir"],
            "adventure": ["adventure", "extreme", "sports", "climbing", "diving"],
            "architecture": ["architecture", "building", "cathedral", "temple"],
            "music": ["music", "concert", "opera", "jazz", "live music"]
        }
        
        for category, keywords in interest_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if category not in interests:
                        interests.append(category)
                    break
        
        # If no specific interests found, add some defaults based on destination type
        if not interests:
            if any(word in text_lower for word in ["city", "urban", "metropolitan"]):
                interests = ["culture", "food", "art"]
            else:
                interests = ["culture", "history"]
        
        return NLPParseResponse(
            destination=destination,
            days=days,
            budget=budget,
            interests=interests,
            confidence=ConfidenceScores(
                destination=dest_confidence,
                days=days_confidence,
                budget=budget_confidence
            )
        )