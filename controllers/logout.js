const logoutRouter = require('express').Router();

logoutRouter.get('/',async(request,response)=>{
    const cookies = request.cookies.accesstoken
    console.log(cookies,'logout')
    // verifico si la cookies existe
    if(!cookies){
        // si no existe la propiedad accesstoken
        return response.status(401).json('usted no a iniciado sesion! ')
    }
    // borrando la cookies del navegado
    response.clearCookie('accesstoken',{
        secure:process.env.NODE_ENV === 'production',
        httpOnly:true
    })
    return response.sendStatus(204)
})

module.exports = logoutRouter;