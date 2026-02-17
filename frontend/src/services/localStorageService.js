/**
 * Local Storage Service for Offline Itinerary Persistence
 * Stores itineraries locally when database is unavailable
 */

const STORAGE_KEY = 'ai_travel_planner_itineraries';

class LocalStorageService {
  
  /**
   * Get all itineraries for current user
   */
  getUserItineraries(userId) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const allItineraries = JSON.parse(data);
      return allItineraries.filter(itin => itin.user_id === userId);
    } catch (error) {
      console.error('Failed to get itineraries from localStorage:', error);
      return [];
    }
  }
  
  /**
   * Save itinerary to localStorage
   */
  saveItinerary(itinerary) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const allItineraries = data ? JSON.parse(data) : [];
      
      // Check if itinerary already exists
      const existingIndex = allItineraries.findIndex(i => i._id === itinerary._id);
      
      if (existingIndex >= 0) {
        // Update existing
        allItineraries[existingIndex] = {
          ...itinerary,
          updated_at: new Date().toISOString()
        };
      } else {
        // Add new
        allItineraries.push({
          ...itinerary,
          created_at: itinerary.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allItineraries));
      console.log('✅ Itinerary saved to localStorage');
      return true;
    } catch (error) {
      console.error('Failed to save itinerary to localStorage:', error);
      return false;
    }
  }
  
  /**
   * Get single itinerary by ID
   */
  getItinerary(itineraryId) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      
      const allItineraries = JSON.parse(data);
      return allItineraries.find(i => i._id === itineraryId) || null;
    } catch (error) {
      console.error('Failed to get itinerary from localStorage:', error);
      return null;
    }
  }
  
  /**
   * Delete itinerary
   */
  deleteItinerary(itineraryId) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return false;
      
      const allItineraries = JSON.parse(data);
      const filtered = allItineraries.filter(i => i._id !== itineraryId);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      console.log('✅ Itinerary deleted from localStorage');
      return true;
    } catch (error) {
      console.error('Failed to delete itinerary from localStorage:', error);
      return false;
    }
  }
  
  /**
   * Clear all itineraries for a user
   */
  clearUserItineraries(userId) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return true;
      
      const allItineraries = JSON.parse(data);
      const filtered = allItineraries.filter(i => i.user_id !== userId);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to clear user itineraries:', error);
      return false;
    }
  }
  
  /**
   * Sync localStorage itineraries to database when it comes back online
   */
  async syncToDatabase(api) {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return { synced: 0, failed: 0 };
      
      const allItineraries = JSON.parse(data);
      const sessionItineraries = allItineraries.filter(i => 
        i._id && i._id.startsWith('session_')
      );
      
      let synced = 0;
      let failed = 0;
      
      for (const itinerary of sessionItineraries) {
        try {
          // Try to save to database
          const response = await api.post('/itineraries', itinerary);
          
          if (response.data) {
            // Update localStorage with real database ID
            const newId = response.data.itinerary._id;
            this.deleteItinerary(itinerary._id);
            this.saveItinerary({ ...itinerary, _id: newId });
            synced++;
          }
        } catch (error) {
          console.error(`Failed to sync itinerary ${itinerary._id}:`, error);
          failed++;
        }
      }
      
      return { synced, failed };
    } catch (error) {
      console.error('Failed to sync itineraries:', error);
      return { synced: 0, failed: 0 };
    }
  }
}

export default new LocalStorageService();
