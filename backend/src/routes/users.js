const express = require('express');
const Joi = require('joi');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  preferences: Joi.object({
    budget: Joi.string().valid('low', 'medium', 'high'),
    interests: Joi.array().items(Joi.string().trim())
  }),
  consent_given: Joi.boolean()
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Users can only access their own profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(id)
      .populate('saved_itineraries', 'destination days created_at')
      .populate('digital_memories', 'title image_url created_on')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               preferences:
 *                 type: object
 *                 properties:
 *                   budget:
 *                     type: string
 *                     enum: [low, medium, high]
 *                   interests:
 *                     type: array
 *                     items:
 *                       type: string
 *               consent_given:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 */
router.patch('/:id', authenticateToken, validateRequest(updateUserSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Users can only update their own profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{id}/export:
 *   get:
 *     summary: Export user data (GDPR compliance)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data export
 *       403:
 *         description: Access denied
 */
router.get('/:id/export', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(id)
      .populate('saved_itineraries')
      .populate('digital_memories')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive data
    delete user.password_hash;
    delete user.refresh_tokens;

    res.json({
      export_date: new Date().toISOString(),
      user_data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user account (GDPR compliance)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       403:
 *         description: Access denied
 */
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // TODO: Implement cascading delete for user's itineraries and memories
    // For now, just delete the user account
    await User.findByIdAndDelete(id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;