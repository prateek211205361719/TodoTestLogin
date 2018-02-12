
const mongoose = require("mongoose");
const  { Schema }  = mongoose;
const _ = require("lodash");
var validator = require('validator');
var bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
        minlength:1,
        trim:true,
        unique:true,
        validate: {
            validator: function(v) {
              return validator.isEmail(v);
            },
            message: '{VALUE} is not a valid email!'
        },
    },
    password:{
        type:String,
        required:true,
        minlength:1,
        trim:true
    },
    tokens:[{
        access:{
            type:String
        },
        token:{
            type:String
        }
    }]
});
userSchema.methods.toJSON = function(){
    var user = this;
    var body = _.pick(user, ['email','_id']);
    return body;
    
};

userSchema.methods.generateToken = function(){
    var user = this;
    var access = 'auth';
    var data = {_id:user._id, access};
    var token = jwt.sign(data, 'sanu211205');
    user.tokens.push({token,access});
    var saveUser = user.save();
    if(saveUser){
        return token;
    }
    return null;

}

userSchema.statics.findByCredential = async function(email, password){
    var User = this;
  
    var existingUser = await User.findOne({email:email});
    if(existingUser){
      var result=  bcrypt.compareSync(password, existingUser.password);
      console.log(result);
      return result ? existingUser : null;
    }else{
        return null;
    }
};

userSchema.statics.findByToken =  async function(token){
    var Users = this;
    try{
        var decoded = jwt.verify(token, 'sanu211205');
        var existing =  await  Users.findOne({
            '_id':decoded._id,
            'tokens.token':token,
            'tokens.access':'auth'
        });
        console.log(existing);
        if(!existing){
            return null;
        }
        return  existing;
    }catch(e){
            return null;
    }
};

userSchema.pre('save', function(next) {
    var user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(!err){
                    user.password = hash;
                    next();
                }
            });
        });
    }else{
        next();
    }
});
  

var Users = mongoose.model('Users', userSchema);
module.exports = {
    Users
};