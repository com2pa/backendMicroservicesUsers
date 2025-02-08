const jwt = require('jsonwebtoken');
const User = require('../models/user');

const usertExtractor = async (request, response, next) => {
  try {
    // Verificar si la cookie con el token está presente
    const token = request.cookies?.accesstoken;
    if (!token) {
      return response.status(401).json({
        error:
          'No estás autorizado para acceder a esta ruta. Cookie "accesstoken" no encontrada.',
      });
    }

    // Verificar si el token es válido
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return response
          .status(403)
          .json({ error: 'Token expirado. Inicia sesión nuevamente.' });
      }
      return response.status(403).json({ error: 'Token inválido.' });
    }

    // Buscar al usuario en la base de datos
    const user = await User.findById(decoded.id);
    if (!user) {
      return response
        .status(404)
        .json({ error: 'Usuario no encontrado en la base de datos.' });
    }

    // Almacenar el usuario en la request (sin información sensible)
    request.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      // Otros campos no sensibles
    };

    // Depuración (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Usuario autenticado:', request.user);
    }

    // Continuar con la ejecución de la ruta
    next();
  } catch (error) {
    console.error('Error en usertExtractor:', error);
    return response.status(500).json({
      error: 'Error interno del servidor.',
      details: error.message, // Proporciona más detalles para depuración
    });
  }
};

module.exports = { usertExtractor };
