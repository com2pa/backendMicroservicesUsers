const refresRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/user')

refresRouter.get('/',async(request,response)=>{
    return response.status(200).json({
        id: request.user.id,
        name: request.user.name,
        role:request.user.role
    })
});

module.exports = refresRouter;