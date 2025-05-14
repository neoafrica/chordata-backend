
const mongoose= require('mongoose')
const commentsSchema= new mongoose.Schema({
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'communityQ&A',
        required: true
    },
   author:{
          type:mongoose.Schema.Types.ObjectId,
          ref:'User',
          required: true
      },
    comment:{
        type:String,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [{
        author:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required: true
        },
        commentId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true
        },
        reply:{
            type:String,
            required:true 
        },
        createdAt:{
            type: Date,
            default: Date.now,
        }
      }],

    createdAt:{
        type: Date,
        default: Date.now,
    }
},
{timestamps:true})

module.exports=  mongoose.model('comments', commentsSchema)