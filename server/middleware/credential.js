

const { Users } = require('../models/user');
module.exports = {
     isValidUser : async function(req, res, next){
        var token = req.header('x-auth');
        var filterUsers = await Users.findByToken(token);
        if(!filterUsers){
            return res.status(401).send();
        }
        req.user = filterUsers;
        req.token =  token;
        next();
    }

}