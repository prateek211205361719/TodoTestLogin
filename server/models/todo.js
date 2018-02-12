
const mongoose = require("mongoose");
const { Schema } = mongoose;
const todoSchema = new Schema({
    text:{
        type:String,
        required:true,
    },
    comleted:{
        type:Boolean,
        default:false
    },
    completedAt:{
        type:String,
        default:null
    },
    _creater:{
        type:Schema.Types.ObjectId,
        required:true,

    }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = {
    Todo
};