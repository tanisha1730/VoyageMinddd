import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
from ..models import RecommendationResponse

class RecommendationService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
    
    def get_recommendations(
        self, 
        user_id: str, 
        preferences: Dict[str, Any], 
        destination: str, 
        poi_candidates: List[Dict[str, Any]]
    ) -> List[RecommendationResponse]:
        """
        Generate personalized recommendations using TF-IDF and cosine similarity.
        """
        if not poi_candidates:
            return []
        
        # Extract user interests
        user_interests = preferences.get("interests", [])
        budget_level = preferences.get("budget", "medium")
        
        # Create user profile text
        user_profile = " ".join(user_interests + [budget_level, destination])
        
        # Create POI descriptions for TF-IDF
        poi_descriptions = []
        poi_metadata = []
        
        for poi in poi_candidates:
            # Combine relevant text fields
            description_parts = []
            
            # Add name and category
            if poi.get("name"):
                description_parts.append(poi["name"])
            
            if poi.get("category"):
                if isinstance(poi["category"], list):
                    description_parts.extend(poi["category"])
                else:
                    description_parts.append(str(poi["category"]))
            
            # Add tags
            if poi.get("tags"):
                if isinstance(poi["tags"], list):
                    description_parts.extend(poi["tags"])
                else:
                    description_parts.append(str(poi["tags"]))
            
            # Add description if available
            if poi.get("description"):
                description_parts.append(poi["description"])
            
            poi_description = " ".join(description_parts).lower()
            poi_descriptions.append(poi_description)
            poi_metadata.append(poi)
        
        # Add user profile to the corpus for comparison
        all_descriptions = poi_descriptions + [user_profile.lower()]
        
        try:
            # Fit TF-IDF vectorizer
            tfidf_matrix = self.vectorizer.fit_transform(all_descriptions)
            
            # Get user profile vector (last item)
            user_vector = tfidf_matrix[-1]
            poi_vectors = tfidf_matrix[:-1]
            
            # Calculate cosine similarity
            similarities = cosine_similarity(user_vector, poi_vectors).flatten()
            
        except Exception as e:
            print(f"TF-IDF calculation failed: {e}")
            # Fallback to simple keyword matching
            similarities = self._fallback_similarity(user_interests, poi_descriptions)
        
        # Create recommendations with scores
        recommendations = []
        for i, (poi, similarity) in enumerate(zip(poi_metadata, similarities)):
            # Adjust score based on additional factors
            score = similarity
            
            # Boost score for highly rated places
            if poi.get("rating"):
                rating_boost = (poi["rating"] - 3.0) / 2.0 * 0.2  # Max 0.2 boost for 5-star
                score += max(0, rating_boost)
            
            # Adjust for budget preferences
            entry_fee = poi.get("entry_fee", 0)
            if budget_level == "low" and entry_fee > 50:
                score *= 0.7
            elif budget_level == "high" and entry_fee == 0:
                score *= 0.9  # Slight preference for paid attractions in high budget
            
            # Ensure score is between 0 and 1
            score = max(0.0, min(1.0, score))
            
            recommendations.append(RecommendationResponse(
                place_id=poi.get("place_id", f"poi_{i}"),
                score=float(score),
                tags=poi.get("tags", [])
            ))
        
        # Sort by score and return top recommendations
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:20]  # Return top 20
    
    def _fallback_similarity(self, user_interests: List[str], poi_descriptions: List[str]) -> np.ndarray:
        """
        Fallback similarity calculation using simple keyword matching.
        """
        similarities = []
        
        for description in poi_descriptions:
            score = 0.0
            description_lower = description.lower()
            
            # Count interest matches
            for interest in user_interests:
                if interest.lower() in description_lower:
                    score += 1.0
            
            # Normalize by number of interests
            if user_interests:
                score = score / len(user_interests)
            
            similarities.append(score)
        
        return np.array(similarities)