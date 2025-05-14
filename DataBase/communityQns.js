
const mongoose= require('mongoose')

const communityQnsSchema= new mongoose.Schema({
    typeOfAnimal:{
        type:String,
    },
    ageOfAnimal:{
        type:String,
    },
    caseHistory:{
        type:String,
    },
    sexOfAnimal:{
        type:String,
    },
    Qn:{
        type:String,
        // required:true
    },
    qnImage: {
        type: Object, // URL to user's profile image
        url:{
          type:String
        },
        public_id:{
          type: String
        }
      },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    // replies:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'comments',
    //     required: true
    // },
    timestamp: {
        type: Date,
        default: Date.now,
      },
})

module.exports=  mongoose.model('communityQ&A', communityQnsSchema)

// const mongoose = require('mongoose');

// const communityQnsSchema = new mongoose.Schema({
//   typeOfAnimal: {
//     type: String,
//   },
//   ageOfAnimal: {
//     type: String,
//   },
//   caseHistory: {
//     type: String,
//   },
//   sexOfAnimal: {
//     type: String,
//   },
//   Qn: {
//     type: String,
//   },
//   qnImage: [
//     {
//       url: {
//         type: String,
//         // required: true,
//       },
//       public_id: {
//         type: String,
//         // required: true,
//       },
//     },
//   ],
//   author: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('communityQ&A', communityQnsSchema);
