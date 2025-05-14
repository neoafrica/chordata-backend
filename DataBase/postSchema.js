
const mongoose= require('mongoose')


const postSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
      },
})


module.exports=  mongoose.model('posts', postSchema)