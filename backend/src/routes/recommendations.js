const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const userRecommendationEngine = require('../services/userRecommendationEngine');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /recommendations/destinations:
 *   get:
 *     summary: Get personalized destination recommendations
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: Personalized recommendations
 *       401:
 *         description: Unauthorized
 */
router.get('/destinations', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    
    logger.info(`🎯 Getting destination recommendations for user: ${userId}`);
    
    const result = await userRecommendationEngine.getDestinationRecommendations(userId, limit);
    
    res.json({
      success: true,
      recommendations: result.recommendations,
      userProfile: {
        totalTrips: result.userProfile.totalTrips,
        topInterests: result.userProfile.interests.slice(0, 5),
        budgetLevel: result.userProfile.budgetRange.level,
        preferredDuration: result.userProfile.tripDuration.preferred
      }
    });
  } catch (error) {
    logger.error('❌ Failed to get recommendations:', error);
    next(error);
  }
});

/**
 * @swagger
 * /recommendations/profile:
 *   get:
 *     summary: Get user's travel profile analysis
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User travel profile
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    logger.info(`📊 Analyzing travel profile for user: ${userId}`);
    
    const profile = await userRecommendationEngine.analyzeUserProfile(userId);
    
    res.json({
      success: true,
      profile: {
        totalTrips: profile.totalTrips,
        visitedDestinations: profile.destinations,
        topInterests: profile.interests,
        budgetRange: profile.budgetRange,
        tripDuration: profile.tripDuration,
        seasonalPreferences: profile.seasonalPreferences,
        favoriteCategories: profile.placeCategories,
        lastTripDate: profile.lastTripDate
      }
    });
  } catch (error) {
    logger.error('❌ Failed to get profile:', error);
    next(error);
  }
});

/**
 * @swagger
 * /recommendations/similar/{destination}:
 *   get:
 *     summary: Get destinations similar to a given destination
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: destination
 *         required: true
 *         schema:
 *           type: string
 *         description: Destination name
 *     responses:
 *       200:
 *         description: Similar destinations
 *       401:
 *         description: Unauthorized
 */
router.get('/similar/:destination', authenticateToken, async (req, res, next) => {
  try {
    const { destination } = req.params;
    
    logger.info(`🔍 Finding destinations similar to: ${destination}`);
    
    const similar = userRecommendationEngine.findSimilarDestinations(destination);
    
    res.json({
      success: true,
      destination,
      similarDestinations: similar
    });
  } catch (error) {
    logger.error('❌ Failed to find similar destinations:', error);
    next(error);
  }
});

module.exports = router;
