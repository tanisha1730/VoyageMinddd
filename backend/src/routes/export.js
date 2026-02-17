const express = require('express');
const puppeteer = require('puppeteer');
const Joi = require('joi');
const Itinerary = require('../models/Itinerary');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schema
const exportSchema = Joi.object({
  itinerary_id: Joi.string().required(),
  format: Joi.string().valid('pdf', 'json').default('pdf'),
  include_map: Joi.boolean().default(true)
});

/**
 * @swagger
 * /export/pdf:
 *   post:
 *     summary: Export itinerary as PDF
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itinerary_id
 *             properties:
 *               itinerary_id:
 *                 type: string
 *               include_map:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Itinerary not found
 */
router.post('/pdf', authenticateToken, validateRequest(exportSchema), async (req, res, next) => {
  try {
    const { itinerary_id, include_map } = req.body;
    const userId = req.user._id;

    // Get itinerary
    const itinerary = await Itinerary.findOne({
      _id: itinerary_id,
      $or: [
        { user_id: userId },
        { is_public: true }
      ]
    }).lean();

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Generate HTML content
    const htmlContent = generateItineraryHTML(itinerary, req.user, include_map);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="itinerary-${itinerary.destination}-${itinerary.generated_on.toISOString().split('T')[0]}.pdf"`);

    res.send(pdf);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /export/json:
 *   post:
 *     summary: Export itinerary as JSON
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itinerary_id
 *             properties:
 *               itinerary_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: JSON export
 *       404:
 *         description: Itinerary not found
 */
router.post('/json', authenticateToken, validateRequest(exportSchema), async (req, res, next) => {
  try {
    const { itinerary_id } = req.body;
    const userId = req.user._id;

    const itinerary = await Itinerary.findOne({
      _id: itinerary_id,
      $or: [
        { user_id: userId },
        { is_public: true }
      ]
    }).lean();

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Set response headers for JSON download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="itinerary-${itinerary.destination}-${itinerary.generated_on.toISOString().split('T')[0]}.json"`);

    res.json(itinerary);
  } catch (error) {
    next(error);
  }
});

function generateItineraryHTML(itinerary, user, includeMap) {
  const mapSection = includeMap ? `
    <div class="map-section">
      <h3>Route Map</h3>
      <img src="https://maps.googleapis.com/maps/api/staticmap?size=600x400&maptype=roadmap&markers=${encodeURIComponent(itinerary.destination)}&key=${process.env.GOOGLE_MAPS_API_KEY}" 
           alt="Itinerary Map" style="width: 100%; max-width: 600px; height: auto;">
    </div>
  ` : '';

  const daysHtml = itinerary.plan.map(day => `
    <div class="day-section">
      <h3>Day ${day.day}</h3>
      <div class="places">
        ${day.places.map(place => `
          <div class="place">
            <h4>${place.name}</h4>
            <p><strong>Time:</strong> ${place.start_time} - ${place.end_time}</p>
            ${place.rating ? `<p><strong>Rating:</strong> ${place.rating}/5</p>` : ''}
            ${place.entry_fee ? `<p><strong>Entry Fee:</strong> $${place.entry_fee}</p>` : ''}
            ${place.notes ? `<p><strong>Notes:</strong> ${place.notes}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Travel Itinerary - ${itinerary.destination}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #007bff;
          margin: 0;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .summary h2 {
          margin-top: 0;
          color: #007bff;
        }
        .day-section {
          margin-bottom: 30px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
        }
        .day-section h3 {
          color: #007bff;
          border-bottom: 1px solid #dee2e6;
          padding-bottom: 10px;
        }
        .place {
          background: #fff;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .place h4 {
          margin: 0 0 10px 0;
          color: #495057;
        }
        .place p {
          margin: 5px 0;
          font-size: 14px;
        }
        .map-section {
          margin: 30px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Travel Itinerary</h1>
        <p><strong>Destination:</strong> ${itinerary.destination}</p>
        <p><strong>Traveler:</strong> ${user.name}</p>
        <p><strong>Generated:</strong> ${itinerary.generated_on.toLocaleDateString()}</p>
      </div>

      <div class="summary">
        <h2>Trip Summary</h2>
        <p><strong>Duration:</strong> ${itinerary.days} days</p>
        <p><strong>Budget:</strong> $${itinerary.budget}</p>
        <p><strong>Format:</strong> ${itinerary.format}</p>
        ${itinerary.title ? `<p><strong>Title:</strong> ${itinerary.title}</p>` : ''}
        ${itinerary.notes ? `<p><strong>Notes:</strong> ${itinerary.notes}</p>` : ''}
      </div>

      ${mapSection}

      <div class="itinerary">
        <h2>Daily Itinerary</h2>
        ${daysHtml}
      </div>

      <div class="footer">
        <p>Generated by AI Travel Planner</p>
        <p>Visit us at: https://ai-travel-planner.com</p>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;