
const express = require("express");

const bodyParser = require('body-parser');
const _ = require("lodash");
const keys = require('./server/config/keys');
//mongoose connection

const { Users } = require('./server/models/user');
const { isValidUser }  = require('./server/middleware/credential');
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

mongoose.connect(keys.mongoURI);

const { Todo } = require('./server/models/todo');


const app = express();
app.use(bodyParser.json());



app.get('/users/me', isValidUser, async (req, res) => {
    res.send(req.user);
});


app.post('/users/signnin', async (req, res) => {
    var body = _.pick(req.body, ['email','password']); 
    try{
        var existingUser =  await Users.findByCredential(body.email, body.password);
        console.log(existingUser);
        if(!existingUser){
           return res.status(404).send();
        }
        var token = existingUser.generateToken();
        res.header('x-auth', token).send(existingUser);
       
    }catch(e){
        res.status(400).send();
    }    
});

app.post('/users/signup', async (req, res) => {
    var body = _.pick(req.body, ['email','password']);
    var user = new Users(body);
    try{
       var newUser = await user.save();
       var token =  await newUser.generateToken();
        if(!token){
          res.status(400).send();
        }
        res.header('x-auth', token).send(newUser);
    }catch(e){
        res.status(400).send(e.message);
    }
});


//create Todo

app.post('/todos',isValidUser, async (req, res) => {
    var body = _.pick(req.body,['text']);
    body._creater = req.user._id;
    var todo = new Todo(body);
    try{
        var newTodo = await todo.save();
        if(!newTodo){
            return res.status(400).send();
        }
        res.send(newTodo);
    }catch(e){
         res.status(400).send(e);
    }
});


//get todo
app.get('/todos',isValidUser, async (req, res) => {
    try{ 
        var todoList = await Todo.find({
            _creater:req.user._id
        });
        if(todoList){
            res.send(todoList); 
        }
    }catch(e){
        res.status(400).send();
    }
});

//delete todo
app.delete('/todos/:id', isValidUser, async (req, res) => {
    var todoId = req.params.id;
    if(ObjectId.isValid(todoId)){
      var result =  await Todo.findOneAndRemove({
          _id:todoId,
          _creater:req.user._id
      });
      if(!result)
        return  res.status(400).send();

        res.send(result);
    }else{
        res.status(400).send();
    }
  
});


app.patch('/todos/:id', isValidUser, async (req, res) => {
    var todoId = req.params.id;
    if(!ObjectId.isValid(todoId)){
        res.status(400).send();
    }
    var body = _.pick(req.body,['text','comleted']);
    if(_.isBoolean(body.comleted)  && body.comleted){
        body.completedAt = new Date().getTime().toString();
    }else{
        body.comleted = false;
        body.completedAt = null;
    }
    try{   
        var updateTodo = await Todo.findOneAndUpdate({_id:todoId,_creater:req.user._id},{$set:body},{new :true});
        if(!updateTodo){
            return  res.status(404).send();
        }
        res.send(updateTodo);
    }catch(e){
        res.status(400).send();
    }
});




const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('---------running----');
});