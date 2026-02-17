import random
from typing import Dict, Any, Optional

class PostcardService:
    def __init__(self):
        # Template categories for different types of places
        self.templates = {
            "museum": [
                "Exploring the fascinating exhibits at {name} on this {weather} {date}!",
                "Lost in history and art at {name}. What an incredible {weather} day!",
                "Cultural immersion at its finest - {name} never disappoints!"
            ],
            "restaurant": [
                "Savoring delicious flavors at {name} on {date}. Perfect {weather} weather for dining!",
                "Culinary adventure at {name} - every bite is a delight!",
                "Food heaven found at {name}! This {weather} day just got better."
            ],
            "park": [
                "Nature's beauty at {name} on this {weather} {date}. Pure bliss!",
                "Peaceful moments in {name}. The {weather} weather makes it perfect!",
                "Green paradise at {name} - exactly what the soul needed!"
            ],
            "beach": [
                "Sun, sand, and serenity at {name}! This {weather} {date} is unforgettable.",
                "Beach vibes at {name} - living the dream on this {weather} day!",
                "Waves and wonder at {name}. Perfect {weather} for beach time!"
            ],
            "monument": [
                "Standing in awe at {name} on {date}. History comes alive on this {weather} day!",
                "Magnificent {name} - a testament to human achievement!",
                "Breathtaking architecture at {name}. This {weather} weather adds to the magic!"
            ],
            "shopping": [
                "Retail therapy at {name}! Perfect {weather} day for some shopping fun.",
                "Discovering treasures at {name} on this lovely {weather} {date}!",
                "Shopping adventures at {name} - finding amazing deals!"
            ],
            "church": [
                "Finding peace and tranquility at {name} on this {weather} {date}.",
                "Spiritual moments at the beautiful {name}. Blessed {weather} day!",
                "Sacred serenity at {name} - a perfect place for reflection."
            ],
            "default": [
                "Amazing experience at {name} on this {weather} {date}!",
                "Wonderful memories being made at {name}. What a {weather} day!",
                "Exploring the incredible {name} - travel dreams coming true!",
                "Perfect {weather} day to visit {name}. Loving every moment!",
                "Adventure continues at {name}! This {weather} weather is ideal."
            ]
        }
        
        # Weather-specific adjectives
        self.weather_adjectives = {
            "sunny": ["beautiful", "gorgeous", "perfect", "brilliant", "glorious"],
            "cloudy": ["pleasant", "comfortable", "mild", "nice", "cozy"],
            "rainy": ["refreshing", "atmospheric", "moody", "dramatic", "cleansing"],
            "snowy": ["magical", "winter wonderland", "pristine", "enchanting", "peaceful"],
            "windy": ["invigorating", "fresh", "dynamic", "energizing", "brisk"],
            "clear": ["crystal clear", "perfect", "ideal", "stunning", "magnificent"]
        }
    
    def generate_caption(
        self, 
        poi: Dict[str, Any], 
        date: str, 
        weather: str, 
        image_features: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate a personalized postcard caption based on POI, date, weather, and optional image features.
        """
        poi_name = poi.get("name", "this amazing place")
        poi_categories = poi.get("category", [])
        poi_tags = poi.get("tags", [])
        
        # Determine the primary category for template selection
        template_category = self._get_template_category(poi_categories, poi_tags)
        
        # Get appropriate templates
        templates = self.templates.get(template_category, self.templates["default"])
        
        # Select a random template
        template = random.choice(templates)
        
        # Enhance weather description
        weather_desc = self._enhance_weather_description(weather.lower())
        
        # Format the date nicely
        formatted_date = self._format_date(date)
        
        # Generate the caption
        caption = template.format(
            name=poi_name,
            date=formatted_date,
            weather=weather_desc
        )
        
        # Add image-based enhancements if available
        if image_features:
            caption = self._enhance_with_image_features(caption, image_features)
        
        # Add some personality based on POI characteristics
        caption = self._add_personality_touch(caption, poi)
        
        return caption
    
    def _get_template_category(self, categories: list, tags: list) -> str:
        """
        Determine the best template category based on POI categories and tags.
        """
        all_descriptors = [str(item).lower() for item in categories + tags]
        descriptors_text = " ".join(all_descriptors)
        
        # Priority mapping - more specific matches first
        category_keywords = {
            "museum": ["museum", "gallery", "art", "exhibition", "cultural_center"],
            "restaurant": ["restaurant", "cafe", "food", "dining", "bistro", "eatery"],
            "beach": ["beach", "seaside", "coast", "shore", "waterfront"],
            "park": ["park", "garden", "nature", "botanical", "green_space"],
            "monument": ["monument", "memorial", "statue", "landmark", "historic"],
            "church": ["church", "cathedral", "temple", "mosque", "synagogue", "religious"],
            "shopping": ["shopping", "mall", "market", "boutique", "store", "retail"]
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in descriptors_text for keyword in keywords):
                return category
        
        return "default"
    
    def _enhance_weather_description(self, weather: str) -> str:
        """
        Enhance weather description with appropriate adjectives.
        """
        weather_lower = weather.lower()
        
        # Find matching weather type
        for weather_type, adjectives in self.weather_adjectives.items():
            if weather_type in weather_lower:
                return random.choice(adjectives)
        
        # Default enhancement
        if "rain" in weather_lower:
            return random.choice(self.weather_adjectives["rainy"])
        elif "sun" in weather_lower:
            return random.choice(self.weather_adjectives["sunny"])
        elif "cloud" in weather_lower:
            return random.choice(self.weather_adjectives["cloudy"])
        else:
            return weather  # Return original if no match
    
    def _format_date(self, date: str) -> str:
        """
        Format date string nicely for captions.
        """
        try:
            from datetime import datetime
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            return date_obj.strftime("%B %d, %Y")
        except:
            return date  # Return original if parsing fails
    
    def _enhance_with_image_features(self, caption: str, image_features: Dict[str, Any]) -> str:
        """
        Enhance caption based on image analysis features.
        """
        # This is a placeholder for image feature analysis
        # In a real implementation, you might analyze:
        # - Colors (sunset, blue sky, etc.)
        # - Objects detected (people, buildings, etc.)
        # - Scene type (indoor, outdoor, etc.)
        
        if image_features.get("has_people"):
            caption += " Great company makes it even better!"
        
        if image_features.get("sunset"):
            caption += " The sunset views are absolutely breathtaking!"
        
        if image_features.get("architecture"):
            caption += " The architecture here is simply stunning!"
        
        return caption
    
    def _add_personality_touch(self, caption: str, poi: Dict[str, Any]) -> str:
        """
        Add personality touches based on POI characteristics.
        """
        rating = poi.get("rating", 0)
        
        # Add enthusiasm based on rating
        if rating >= 4.5:
            enthusiasm_phrases = [
                " Absolutely incredible!",
                " Mind-blowing experience!",
                " This place is pure magic!",
                " Exceeded all expectations!"
            ]
            caption += random.choice(enthusiasm_phrases)
        elif rating >= 4.0:
            positive_phrases = [
                " Highly recommend!",
                " Such a gem!",
                " Really worth the visit!",
                " Fantastic experience!"
            ]
            caption += random.choice(positive_phrases)
        
        # Add travel-specific hashtags occasionally
        if random.random() < 0.3:  # 30% chance
            hashtags = [
                " #TravelMemories",
                " #Wanderlust",
                " #ExploreMore",
                " #TravelDiaries",
                " #AdventureTime"
            ]
            caption += random.choice(hashtags)
        
        return caption