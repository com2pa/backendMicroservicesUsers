const loginRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

loginRouter.post('/', async(request,response)=>{
    // lo que envia desde el frontEnd
    const {email, password} = request.body
    // verificando si el usuario existe
    const userExist = await User.findOne({email})
    // console.log(userExist);
    if(!userExist){
        return response.status(400).json({error:'email o contraseña invalida por favor revisar!'})
    }
    
    // // si el usuario esta verificado
    if(!userExist.verificacion){
        return response.status(400).json({error:'Tu! email no ha sido verificado por favor revisar!'})
    }
    
// verifico si la contraseña es correcta
    const saltRounds = 10
    const isCorrect= await bcrypt.compare(password, userExist.password)
    if(!isCorrect){
        return response.status(400).json({error:'Email o Contraseña invalida por favor revisar'})
    }
    
    // generar un token 
    const userForToken={
        id: userExist.id,
        name: userExist.name,
        role: userExist.role,
        // email: userExist.email,
    }
    // veo quien inicio sesion
    console.log('inicio sesion',userForToken)
    
    // el token dura 1 un dia!
    const accesstoken = jwt.sign(userForToken, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
    });
    // console.log(new Date());
    // console.log(new Date(Date.now()+ 1000 * 60 * 60 * 24 * 1 ));
    
    // guardarlo en las cookies
    // expires: new Date(Date.now() + 900000 // 15min
    response.cookie('accesstoken', accesstoken, { 
       expires: new Date(Date.now()+ 1000 * 60 * 60 * 24 * 1 ),
       httpOnly: true, // solo pueda ser leido por el lado del cliente
       secure: process.env.NODE_ENV === 'production'  // solo en el caso de que se este en el entorno de producción (no en desarrollo)  // solo puede ser accedido por el server
    });
    // enviar respuesta con el token
    return response.status(200).json(userForToken);

});

module.exports = loginRouter;
