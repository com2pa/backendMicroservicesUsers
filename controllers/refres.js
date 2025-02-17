const refresRouter = require('express').Router();
const { usertExtractor } = require('../middleware/auth');

refresRouter.get('/', async (request, response) => {
  return response.status(200).json({
    id: request.user.id,
    name: request.user.name,
    role: request.user.role,
  });
});

module.exports = refresRouter;
