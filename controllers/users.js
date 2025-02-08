const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
// envio de confirmacion de correo
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { PAGE_URL } = require('../config');

// muestro todo los usuarios

usersRouter.get('/', async (request, response) => {  
  const users = await User.find({})
  // console.log('todos los usuarios', users)
  return response.json(users);
});

// creando usuario
usersRouter.post('/', async (request, response) => {
  const { name, email, password } = request.body;
  // verificando que todos existen
  if (!name || !email || !password) {
    return response
      .status(400)
      .json({ error: 'Todos los campon son requerido' });
  }
  const userExist = await User.findOne({ email });
  if (userExist) {
    return response
      .status(400)
      .json({ error: 'El email ya se encuentra en uso !' });
  }
  // return response.sendStatus(200);

  //     // encriptando la constraseña
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  // console.log(passwordHash);
  // creando nuevo usuario en la base de datos
  const newUser = new User({
    name,
    email,
    password: passwordHash,
  });
  //     // guardando usuario registrado
  const savedUser = await newUser.save();
  console.log(savedUser);

  // el token dura 1 un dia!
  const token = jwt.sign(
    { id: savedUser.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '1d',
    }
  );
  // console.log(token);

  //     // enviar correo para verificacion de usuaruio registrado
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //     //  como enviar el correo
  await transporter.sendMail({
    from: process.env.EMAIL_USER, // sender address
    to: email, // list of receivers
    subject: 'Verificacion de usuario :)  ✔', // Subject line
    text: 'Acontinuacion se presenta este link para poder validar tu registro en la pagina',
    html: `<a href="${PAGE_URL}/verify/${savedUser.id}/${token}">Verificar Correo por favor ! </a>`,
  });

  //     // console.log(transporter);
  return response
    .status(201)
    .json('¡ USUARIO CREADO! :)   , verifique su correo para confirmar !   ');
});

usersRouter.patch('/:id/:token', async (request, response) => {
  try {
    const token = request.params.token;

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const id = decodedToken.id;

    // cambiando la propiedad de la base de datos verificacion de correo a true
    await User.findByIdAndUpdate(id, { verificacion: true });
    return response.sendStatus(200);
  } catch (error) {
    //    encontrar el email del usuario
    const id = request.params.id;
    const { email } = await User.findById(id);
    //    console.log(email)

    // firmar el nuevo token
    const token = jwt.sign({ id: id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1d',
    });

    // enviar correo para verificacion de usuaruio registrado

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    //  como enviar el correo

    await transporter.sendMail({
      from: process.env.EMAIL_USER, // sender address
      to: email, // list of receivers
      subject: 'Verificacion de usuario :)  ✔', // Subject line
      text: 'Acontinuacion se presenta este link para poder validar tu registro en la pagina',
      html: `<a href="${PAGE_URL}/verify/${id}/${token}">Verificar Correo por favor ! </a>`,
    });

    return response
      .status(400)
      .json({
        error:
          'El link expiro. Se ha enviado un ¡Nuevo link! de verificacion a su correo',
      });
  }
});
module.exports = usersRouter;
