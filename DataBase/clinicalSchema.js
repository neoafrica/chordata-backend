const mongoose = require("mongoose");

const clinicalSchema = new mongoose.Schema({
  category: {
    type: String,
  },
  caseTitle: {
    type: String,
  },
  typeOfAnimal: {
    type: String,
  },
  sexOfAnimal: {
    type: String,
  },
  ageOfAnimal: {
    type: String,
  },
  caseHistory: {
    type: String,
  },
  clinicalFindings: {
    type: String,
  },
  clinicalManagement: {
    type: String,
  },
  drugsUsed: {
    type: String,
  },
  caseImage: {

    // type:[String]
    // type: Object, // URL to user's profile image
    // url: {
    //   type: String,
    // },
    // public_id: {
    //   type: String,
    // },

    type: Array, // URL to user's profile image
    url:[
        {
        type:String,
        }
    ],
    public_id:[{
      type: String
    }]
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("clinicalcases", clinicalSchema);
