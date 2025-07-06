const User = require("../DataBase/UserSchema");
const { cloudinary } = require("../cloudinary/index");
const posts = require("../DataBase/postSchema");
const clinical = require("../DataBase/clinicalSchema");
const bcrypt = require("bcrypt");
const frontImage = require("../DataBase/frontImage");
const StoryBillBoard = require("../DataBase/storyBillBoard");
const Cases = require("../DataBase/Cases");
const getTimeAgo = require("./getTime");


exports.createUser = async function (request, response) {
  const {
    username,
    password,
    email,
    bio,
    profileImage,
    timestamp,
    phone,
    role,
  } = request.body;

  console.log(email, password, username, phone);

  if (!email || !password || !username || !phone || !role) {
    return response.status(400).json({ message: "All fields are required" });
  }
  // check existed user
  const Email = await User.findOne({ email });

  const userName = await User.findOne({ username });

  if (Email) {
    return response.send({ message: "email exist Log in" });

    // return response.status(401).json({error:"user already exist"})
  }

  if (userName) {
    return response.send({ message: "user name exist Log in" });

    // return response.status(401).json({error:"user already exist"})
  }

  const encryptedPassword = await bcrypt.hash(password, 8);
  try {
    const newUser = new User({
      username,
      password: encryptedPassword,
      email,
      bio,
      profileImage,
      timestamp,
      phoneNumber: phone,
      role,
    });
    await newUser.save();
    response.send({ status: "ok", data: "user created" });
  } catch (error) {
    response.status(500).send({ status: "error", data: error });
  }
};

exports.clinicalCase = async (request, response) => {
  const {
    category,
    caseTitle,
    typeOfAnimal,
    sexOfAnimal,
    ageOfAnimal,
    caseHistory,
    clinicalFindings,
    clinicalManagement,
    drugsUsed,
    caseImage,
    timestamp,
  } = request.body;

  const newPost = new clinical({
    category,
    caseTitle,
    typeOfAnimal,
    sexOfAnimal,
    ageOfAnimal,
    caseHistory,
    clinicalFindings,
    clinicalManagement,
    drugsUsed,
    caseImage,
    timestamp,
  });
  //  const {public_id, secure_url}= caseImage

  // caseImage.map((image, index)=>{
  //   const url= image.secure_url
  //   const public_id= image.public_id
  //   console.log(url)

  //   if(index==0){

  //     newPost.caseImage= {url, public_id}
  //   }
  //   else if (index==1){
  //     newPost.caseImage= [...[url, public_id]]
  //   }
  // })
  // newPost.caseImage= {secure_url, public_id}

  await newPost.save();
  // console.log(caseImage)  // 9
};

exports.frontImage = async (request, response) => {
  const { description } = request.body;

  console.log("here", description);

  const newFrontImage = new frontImage({ description });
  try {
    if (request.file) {
      const { secure_url: url, public_id } = await cloudinary.uploader.upload(
        request.file.path
      );
      newFrontImage.Image = { url, public_id };
    }

    // newFrontImage.description= description
    await newFrontImage.save();

    response.send({ newFrontImage });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "failure" });
  }
};

exports.getFrontImage = async (request, response) => {
  const Image = await frontImage.find({}).sort({ createdAt: -1 });

  // console.log(Image)
  response.json(
    Image.map((post, index) => ({
      id: post._id,
      description: post.description,
      Image: post.Image,
      createdAt: getTimeAgo(post.createdAt),
    }))
  );
};

exports.StoryBillboard = async (request, response) => {
  const { description } = request.body;

  // console.log("here", description);

  const newFrontImage = new StoryBillBoard({ description });
  try {
    if (request.file) {
      const { secure_url: url, public_id } = await cloudinary.uploader.upload(
        request.file.path
      );
      newFrontImage.Image = { url, public_id };
    }

    // newFrontImage.description= description
    await newFrontImage.save();

    response.send({ newFrontImage });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "failure" });
  }
};

exports.getBillBoardImage = async (request, response) => {
  const Image = await StoryBillBoard.find({}).sort({ createdAt: -1 });

  // console.log(Image)
  response.json(
    Image.map((post, index) => ({
      id: post._id,
      description: post.description,
      Image: post.Image,
      createdAt: getTimeAgo(post.createdAt),
    }))
  );
};

// Delete front Image

exports.deleteFrontImage = async (request, response) => {
  const { postId } = request.params;

  // console.log(postId)

  try {
    const existedImages = await frontImage.findById(postId);

    const public_id = existedImages.Image.public_id;

    console.log("public id =>", public_id);
    if (!existedImages) {
      return response.status(404).json({ error: "No post found" });
    }
    if (existedImages.Image) {
      const result = await cloudinary.uploader.destroy(public_id);
      console.log(`Deleted image:`, result);
    }

    await frontImage.findByIdAndDelete(postId);
    return response.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting Post:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Delete billboard image

exports.deleteStoryBillBoardImage = async (request, response) => {
  const { postId } = request.params;

  // console.log(postId)

  try {
    const existedImages = await StoryBillBoard.findById(postId);

    const public_id = existedImages.Image.public_id;

    console.log("public id =>", public_id);
    if (!existedImages) {
      return response.status(404).json({ error: "No post found" });
    }
    if (existedImages.Image) {
      const result = await cloudinary.uploader.destroy(public_id);
      console.log(`Deleted image:`, result);
    }

    await StoryBillBoard.findByIdAndDelete(postId);
    return response.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting Post:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// For cases images on backend

exports.CreateCases = async (request, response) => {

  try {
    // console.log("Files received:", request.files);
    // console.log("Body received:", request.body);
    const {
      author,
      category,
      caseTitle,
      typeOfAnimal,
      sexOfAnimal,
      ageOfAnimal,
      caseHistory,
      clinicalFindings,
      clinicalManagement,
      drugsUsed,
      DifferentialDiagnosis,
      VaccineAgainst,
      VaccinationRegime,
      TypeOfVaccine,
      managementCategory,
      description,
      TentativeDiagnosis,
      recommendations,
      ProceduralSteps,
      Poc,
    } = request.body;

    // req.files already contains URLs from Cloudinary
    const imageUploads = request.files.map((file) => ({
      url: file.path,
      id: file.filename,
    }));

    const newPost = new Cases({
      author,
      category,
      caseTitle,
      typeOfAnimal,
      sexOfAnimal,
      ageOfAnimal,
      caseHistory,
      clinicalFindings,
      clinicalManagement,
      drugsUsed,
      DifferentialDiagnosis,
      VaccineAgainst,
      VaccinationRegime,
      TypeOfVaccine,
      managementCategory,
      description,
      TentativeDiagnosis,
      recommendations,
      ProceduralSteps,
      Poc,
      caseImage: imageUploads,
    });

    await newPost.save();

    response.status(200).json({ status: "ok", data: "Post added" });
  } catch (error) {
    console.error("Error while creating case:", error); // Add this line
    response.status(500).json({ status: "error", message: error.message });
  }
};

// Copy for testing

// exports.CreateCases = async (request, response) => {
//   try {
//     // console.log("Files received:", request.files);
//     // console.log("Body received:", request.body);
//     const {
//       author,
//       category,
//       caseTitle,
//       typeOfAnimal,
//       sexOfAnimal,
//       ageOfAnimal,
//       caseHistory,
//       clinicalFindings,
//       clinicalManagement,
//       drugsUsed,
//       DifferentialDiagnosis,
//       VaccineAgainst,
//       VaccinationRegime,
//       TypeOfVaccine,
//       managementCategory,
//       description,
//       TentativeDiagnosis,
//       recommendations,
//       ProceduralSteps,
//       Poc,
//     } = request.body;

//     // req.files already contains URLs from Cloudinary
//     const imageUploads = request.files.map((file) => ({
//       url: file.path,
//       id: file.filename,
//     }));

//     const users = await User.find({
//       _id: { $ne: author },
//       pushToken: { $exists: true },
//     });

//     users.forEach((user) => {
//       sendPushNotification(
//         user.pushToken,
//         `New Case: ${newPost.caseTitle}`,
//         `Posted by ${newPost.author}`
//       );
//     });

//     const newPost = new Cases({
//       author,
//       category,
//       caseTitle,
//       typeOfAnimal,
//       sexOfAnimal,
//       ageOfAnimal,
//       caseHistory,
//       clinicalFindings,
//       clinicalManagement,
//       drugsUsed,
//       DifferentialDiagnosis,
//       VaccineAgainst,
//       VaccinationRegime,
//       TypeOfVaccine,
//       managementCategory,
//       description,
//       TentativeDiagnosis,
//       recommendations,
//       ProceduralSteps,
//       Poc,
//       caseImage: imageUploads,
//     });

//     await newPost.save();

//     response.status(200).json({ status: "ok", data: "Post added" });
//   } catch (error) {
//     console.error("Error while creating case:", error); // Add this line
//     response.status(500).json({ status: "error", message: error.message });
//   }
// };


// Notifications

// Middleware: Assume req.userId is set by auth

// exports.Notifications = async (req, res) => {
//   const { token } = req.body;
//   const userId = req.userId;

//   if (!token || !userId) {
//     return res.status(400).json({ success: false, message: "Missing data" });
//   }

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { expoPushToken: token },
//       { new: true }
//     );
//     res.json({ success: true, message: "Token saved" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.PushNotifications = async (req, res) => {
//   const { userId, pushToken } = req.body;
//   await User.findByIdAndUpdate(userId, { pushToken });
//   res.sendStatus(200);
// };

// async function sendPushNotification(pushToken, title, message) {
//   if (!Expo.isExpoPushToken(pushToken)) return;

//   const messages = [
//     {
//       to: pushToken,
//       sound: "default",
//       title: title,
//       body: message,
//     },
//   ];

//   let chunks = expo.chunkPushNotifications(messages);
//   for (let chunk of chunks) {
//     try {
//       await expo.sendPushNotificationsAsync(chunk);
//     } catch (error) {
//       console.error(error);
//     }
//   }
// }
