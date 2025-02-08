const jwt = require('jsonwebtoken');
const User = require('../models/user');

const usertExtractor = async (request, response, next) => {
  try {
    //  Verificar si la cookie con el token está presente
    const token = request.cookies?.accesstoken;
    if (!token) {
      return response
        .status(401)
        .json({
          error:
            'No estás autorizado para acceder a esta ruta (Token no encontrado)',
        });
    }

    //  Verificar si el token es válido
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return response.status(403).json({ error: 'Token inválido o expirado' });
    }

    //  Buscar al usuario en la base de datos
    const user = await User.findById(decoded.id);
    if (!user) {
      return response.status(404).json({ error: 'Usuario no encontrado' });
    }

    //  Almacenar el usuario en la request
    request.user = user;
    console.log('Usuario autenticado:', request.user); // Para depuración

    //  Continuar con la ejecución de la ruta
    next();
  } catch (error) {
    console.error('Error en usertExtractor:', error);
    return response.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { usertExtractor };
