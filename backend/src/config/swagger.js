const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Travel Planner API',
      version: '1.0.0',
      description: 'API for AI-powered travel planning application',
      contact: {
        name: 'API Support',
        email: 'support@ai-travel-planner.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.ai-travel-planner.com' 
          : 'http://localhost:3001',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            preferences: {
              type: 'object',
              properties: {
                budget: { type: 'string', enum: ['low', 'medium', 'high'] },
                interests: { type: 'array', items: { type: 'string' } }
              }
            },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Place: {
          type: 'object',
          properties: {
            place_id: { type: 'string' },
            name: { type: 'string' },
            category: { type: 'array', items: { type: 'string' } },
            location: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' }
              }
            },
            rating: { type: 'number' },
            opening_hours: { type: 'object' },
            entry_fee: { type: 'number' },
            city: { type: 'string' },
            country: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            last_updated: { type: 'string', format: 'date-time' }
          }
        },
        Itinerary: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user_id: { type: 'string' },
            destination: { type: 'string' },
            days: { type: 'number' },
            budget: { type: 'number' },
            plan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  places: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        place_id: { type: 'string' },
                        name: { type: 'string' },
                        start_time: { type: 'string' },
                        end_time: { type: 'string' },
                        location: {
                          type: 'object',
                          properties: {
                            lat: { type: 'number' },
                            lng: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            generated_on: { type: 'string', format: 'date-time' },
            format: { type: 'string', enum: ['standard', 'detailed', 'compact'] }
          }
        },
        Memory: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user_id: { type: 'string' },
            title: { type: 'string' },
            image_url: { type: 'string' },
            note: { type: 'string' },
            caption: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                place_id: { type: 'string' },
                name: { type: 'string' },
                lat: { type: 'number' },
                lng: { type: 'number' }
              }
            },
            tags: { type: 'array', items: { type: 'string' } },
            created_on: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  }));
  
  // Serve OpenAPI spec as JSON
  app.get('/docs/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

module.exports = {
  setupSwagger,
  specs
};