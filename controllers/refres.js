const refresRouter = require('express').Router();
const { usertExtractor } = require('../middleware/auth');

refresRouter.get('/', usertExtractor, async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'No autorizado' });
  }

  return response.status(200).json({
    id: request.user.id,
    name: request.user.name,
    role: request.user.role,
  });
});

module.exports = refresRouter;
