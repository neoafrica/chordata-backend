const mongoose = require("mongoose");

const casesSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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
    DifferentialDiagnosis: {
      type: String,
    },
    VaccineAgainst: {
      type: String,
    },
    VaccinationRegime: {
      type: String,
    },
    TypeOfVaccine: {
      type: String,
    },
    managementCategory: {
      type: String,
    },
    description: {
      type: String,
    },
    recommendations: {
      type: String,
    },
    TentativeDiagnosis: {
      type: String,
    },

    ProceduralSteps: {
      type: String,
    },
    Poc: {
      type: String,
    },
    caseImage: {
      type: Object, // URL to user's profile image
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("cases", casesSchema);

