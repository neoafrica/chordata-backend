const { isValidObjectId } = require("mongoose");
const Post = require("../DataBase/postSchema");
const User = require("../DataBase/UserSchema");
const mongoose = require("mongoose");
// const Cloudinary = require("../cloudinary/index");

const { cloudinary } = require("../cloudinary/index");
const clinical = require("../DataBase/clinicalSchema");
const Story = require("../DataBase/storySchema");
const Questions = require("../DataBase/communityQns");
const Comment = require("../DataBase/Comments");
const Cases = require("../DataBase/Cases");
// const { post } = require("../Routers/router");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const SHA256 = require("crypto-js/sha256");
// const { response } = require("express");
const JWT_SECRETE = "onioasnkioewnqipojvk[]jnion/jnidicl9i78hiwefq9koaonci";

const nodemailer = require("nodemailer"); // For email
const otpGenerator = require("otp-generator");

const getTimeAgo = require("../Controllers/getTime");
const Thread = require("../DataBase/Thread");
const Message = require("../DataBase/messages");
// const communityQns = require("../DataBase/communityQns");

exports.deleteUser = async (request, response) => {
  const { PostId } = request.params;
  if (!isValidObjectId(PostId)) {
    return response.status(401).json({ error: "invalid request" });
  }

  const post = await User.findById(PostId);
  if (!post) {
    return response.status(404).json({ error: "No post found" });
  }

  const public_id = post.profileImage?.public_id;
  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);

    if (result !== "ok")
      return response.status(404).json({ error: "image not found" });
  }

  await User.findByIdAndDelete(PostId);

  response.json({ message: "post removed" });
};

exports.deletePost = async (request, response) => {
  const { PostId } = request.params;
  if (!isValidObjectId(PostId)) {
    return response.status(401).json({ error: "invalid request" });
  }
  const userPost = await User.findById(PostId);

  const post = await Post.find({ post: PostId });
  if (!post) {
    return response.status(404).json({ error: "No post found" });
  }

  const Posts = await Post.findById(PostId);

  const public_id = userPost.profileImage?.public_id;
  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);

    if (result !== "ok")
      return response.status(404).json({ error: "image not found" });
  }

  post.forEach(async (p, index) => {
    var Id = p.post;
    var postId = p._id;
    Id = postId;
    await Post.findByIdAndDelete(Id);
    console.log(Id);
  });
  await User.findByIdAndDelete(PostId);

  response.json({ message: "post removed" });
};

exports.updatePost = async (request, response) => {
  const { username, password, email, bio, profileImage, timestamp } =
    request.body;
  const { PostId } = request.params;
  const { file } = request;

  if (!isValidObjectId(PostId)) {
    return response.status(401).json({ error: "invalid request" });
  }

  const existedPost = await User.findById(PostId);
  if (!existedPost) {
    return response.status(404).json({ error: "No post found" });
  }

  const public_id = existedPost.profileImage?.public_id;
  console.log(public_id);
  if (public_id && file) {
    const { result } = await cloudinary.uploader.destroy(public_id);

    if (result !== "ok")
      return response.status(404).json({ error: "image not found" });
  }

  if (file) {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    existedPost.profileImage = { url, public_id };
  }

  existedPost.profileImage = existedPost.profileImage;

  existedPost.username = username;
  existedPost.email = email;
  existedPost.password = password;
  (existedPost.bio = bio),
    // existedPost.profileImage= profileImage,

    await existedPost.save();

  // await User.findByIdAndUpdate(PostId)
  // response.json({existedPost:{
  //     // timestamp,
  //     profileImage,
  //     username,
  //     password,
  //     email
  // }})

  response.send(existedPost);
};

exports.getUser = async (request, response) => {
  const { PostId } = request.params;
  if (!isValidObjectId(PostId)) {
    return response.status(401).json({ error: "invalid request" });
  }

  const existedUser = await User.findById(PostId);
  if (!existedUser) {
    return response.status(404).json({ error: "No post found" });
  }

  const { username, password, email, bio, profileImage, timestamp } =
    existedUser;

  //   response.send(existedPost);

  response.json({
    post: {
      username,
      password,
      email,
      bio,
      profileImage,
      timestamp,
    },
  });
};

exports.getPost = async (request, response) => {
  // fetch the latest post

  const posts = await Post.find({}).sort({ timestamp: -1 }).populate("post");

  response.json(
    posts.map((post, index) => ({
      username: post.post.username,
      title: post.title,
    }))
  );
};

exports.getLatestPost = async (request, response) => {
  const { pageNo = 0, limit = 5 } = request.query;

  const posts = await Post.find({})
    .sort({ timestamp: -1 })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit));

  response.json(posts);
};

exports.searchPost = async (request, response) => {
  const { title } = request.query;
  if (!title.trim()) {
    return response.status(401).json({ error: "search query is missing!" });
  }

  const searchedPost = await Post.find({
    title: { $regex: title, $options: "i" },
  });

  response.json({ searchedPost });
};

exports.relatedPost = async (request, response) => {
  const { PostId } = request.params;
  if (!isValidObjectId(PostId)) {
    return response.status(401).json({ error: "invalid request" });
  }

  const post = await Post.findById(PostId);
  if (!post) {
    return response.status(404).json({ error: "No post found" });
  }

  const relatedPost = await Post.find({
    title: { $in: [...post.title] },
    _id: { $ne: post._id },
  })
    .sort({ timestamp: -1 })
    .limit(5);

  response.json({ relatedPost });
};

//clinical

exports.getClinicalPosts = async (request, response) => {
  try {
    const posts = await clinical.find({}).sort({ timestamp: -1 });

    // response.send({status : 'ok', posts:posts})

    const { caseImage } = posts;

    response.send(
      // posts.map((post, index) => (
      //   post.caseImage.map((image, index)=>(
      //     {url:post.caseImage[index].secure_url,
      //     id:post.caseImage[index].public_id}
      //   ))
      // ))

      // posts.map((post, index) => (
      //   post.caseImage
      // ))

      posts
    );
  } catch (error) {
    response.send({ error });
  }
};

// login user

exports.login = async (request, response) => {
  const { username, password } = request.body;

  // console.log(username, password);

  const oldUser = await User.findOne({ username });

  if (!oldUser) {
    return response.send({ message: "Invalid credentials" });
  }

  // const encryptedPassword= await bcrypt.hash(password, 8)

  // if(!password) throw new Error("Password is missing cannot compare");

  if (!password) {
    return response.send({ error: "missing password" });
  }

  const result = await bcrypt.compare(password, oldUser.password);
  if (result) {
    const token = jwt.sign({ username: oldUser.username }, JWT_SECRETE);
    // const token = jwt.sign({ email: oldUser.email }, JWT_SECRETE);
    if (response.status(201)) {
      response.send({ status: "ok", data: token });
    } else {
      response.send({ error: "error" });
      // response.send({message:'invalid password'})
    }
  }
  if (!result) {
    // return response.send({ error: "Invalid credentials" });
    return response.send({ message: "Invalid credentials" });
  }
};

// Reset or Update password

exports.ResetPassword = async (request, response) => {
  const { email, newPassword } = request.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return response.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 8);

    user.password = hashedPassword;
    await user.save();

    response.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Something went wrong" });
  }
};

//userData after login
exports.getUserData = async (request, response) => {
  const { token } = request.body;
  try {
    const user = jwt.verify(token, JWT_SECRETE);
    // const email= user.email
    const username = user.username;
    User.findOne({ username: username }).then((data) => {
      return response.send({ status: "ok", data: data });
    });
    // User.findOne({ email: email }).then((data) => {
    //   return response.send({ status: "ok", data: data });
    // });
  } catch (error) {
    response.send({ error: "error" });
  }
};

// Update profile

// exports.updateUserProfile = async (request, response) => {
//   const { profileImage, phoneNumber, bio, email, userId } = request.body;

//   console.log(email)

//   try {
//     const existedUser = await User.findById(userId);
//     if (!existedUser) {
//       return response.status(404).json({ error: "User not found" });
//     }

//     // Delete old image if a new one is provided
//     if (profileImage && profileImage !== existedUser.profileImage?.secure_url) {
//       const public_id = existedUser.profileImage?.public_id;
//       if (public_id) {
//         await Cloudinary.uploader.destroy(public_id);
//       }
//       existedUser.profileImage = profileImage;
//     }

//     // Conditionally update fields if new values are provided
//     existedUser.phoneNumber = phoneNumber || existedUser.phoneNumber;
//     existedUser.bio = bio || existedUser.bio;
//     existedUser.email = email || existedUser.email;

//     await existedUser.save();

//     response.status(200).json({
//       message: "Profile updated successfully",
//       user: existedUser,
//     });
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     response.status(500).json({ error: "Internal server error" });
//   }
// };

exports.updateUserProfile = async (request, response) => {
  const { profileImage, phoneNumber, bio, email, userId } = request.body;

  try {
    const existedUser = await User.findById(userId);

    if (!existedUser) {
      return response.status(404).json({ error: "User not found" });
    }

    // --- PROFILE IMAGE LOGIC ---
    if (profileImage) {
      // If user already had an image and new image is different, delete old image
      if (
        existedUser.profileImage?.secure_url &&
        profileImage !== existedUser.profileImage.secure_url
      ) {
        const public_id = existedUser.profileImage.public_id;
        if (public_id) {
          await cloudinary.uploader.destroy(public_id);
        }
      }

      // Whether or not user had an image, now set new image
      existedUser.profileImage = profileImage;
    }

    // --- UPDATE OTHER FIELDS ---
    existedUser.phoneNumber = phoneNumber || existedUser.phoneNumber;
    existedUser.bio = bio || existedUser.bio;
    existedUser.email = email || existedUser.email;

    await existedUser.save();

    response.status(200).json({ message: "success" });
  } catch (error) {
    console.error("Error updating profile:", error);
    response.status(500).json({ error: "Internal server error" });
  }
};

// create story

exports.createStory = async (request, response) => {
  const { title, body, author } = request.body;
  console.log(body);

  try {
    const newStory = new Story({
      title,
      body,
      author,
    });
    await newStory.save();
    response.status(200).json({ status: "ok", data: "story created" });
  } catch (error) {
    response.send({ status: "error", data: error });
  }
};

// get stories for Admin

exports.getStory = async (request, response) => {
  // fetch the latest post
  try {
    const stories = await Story.find({})
      .sort({ timestamp: -1 })
      .populate("author");

    const dataWithComments = await Promise.all(
      stories.map(async (post) => {
        const comments = await Comment.find({ postId: post._id });
        return {
          id: post._id,
          likes: post.likes,
          bookmarks: post.bookmarks,
          username: post.author.username,
          authorPic: post.author.profileImage?.secure_url,
          title: post.title,
          body: post.body,
          timestamp: post.timestamp,
          comments: comments,
        };
      })
    );
    response.json(dataWithComments);
  } catch (error) {
    console.error("Error fetching story:", error);
    response.status(500).json({ message: "Internal server error" });
  }
};

// Det story for users with pagination

exports.getStoryData = async (request, response) => {
  try {
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 5;
    const skip = (page - 1) * limit;

    const stories = await Story.find({})
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author");

    const dataWithComments = await Promise.all(
      stories.map(async (post) => {
        const comments = await Comment.find({ postId: post._id });
        return {
          id: post._id,
          likes: post.likes,
          bookmarks: post.bookmarks,
          username: post.author.username,
          authorPic: post.author.profileImage?.secure_url || null,
          title: post.title,
          body: post.body,
          timestamp: post.timestamp,
          comments,
        };
      })
    );

    response.json(dataWithComments);
  } catch (error) {
    console.error("Error fetching story:", error);
    response.status(500).json({ message: "Internal server error" });
  }
};

// Get story by Id for admin panel

exports.getStoryById = async (request, response) => {
  // fetch the latest post
  const { storyId } = request.params;
  const story = await Story.findById(storyId)
    .sort({ timestamp: -1 })
    .populate("author");

  response.json({
    id: story._id,
    likes: story.likes,
    bookmarks: story.bookmarks,
    username: story.author.username,
    authorPic: story.author.profileImage?.secure_url,
    title: story.title,
    body: story.body,
    timestamp: story.timestamp,
  });
};

// My Story

exports.myStory = async (request, response) => {
  const { authorId } = request.params;
  // fetch the latest post

  const stories = await Story.find({ author: authorId })
    .sort({ timestamp: -1 })
    .populate("author");

  response.json(
    stories.map((post, index) => ({
      id: post._id,
      likes: post.likes,
      bookmarks: post.bookmarks,
      username: post.author.username,
      authorPic: post.author.profileImage?.secure_url,
      title: post.title,
      body: post.body,
      timestamp: post.timestamp,
    }))
  );
};

//Community questions

// exports.questions = async (request, response) => {
//   const {
//     Qn,
//     qnImage,
//     caseHistory,
//     ageOfAnimal,
//     typeOfAnimal,
//     sexOfAnimal,
//     author,
//   } = request.body;

//   // console.log(author)
//   try {
//     const newQuestion = new Questions({
//       Qn,
//       qnImage,
//       caseHistory,
//       ageOfAnimal,
//       typeOfAnimal,
//       sexOfAnimal,
//       author,
//     });
//     await newQuestion.save();
//     response.status(200).json({ status: "ok", data: "Question posted" });
//   } catch (error) {
//     response.send({ status: "error", data: error });
//   }
// };

// Community questions with formData

// exports.questions = async (req, res) => {
//   const {
//     Qn,
//     caseHistory,
//     ageOfAnimal,
//     typeOfAnimal,
//     sexOfAnimal,
//     author,
//   } = req.body;

//   try {
//     const qnImage = req.files?.map(file => ({
//       url: file.path,
//       id: file.filename,
//     }));

//     const newQuestion = new Questions({
//       Qn,
//       qnImage,
//       caseHistory,
//       ageOfAnimal,
//       typeOfAnimal,
//       sexOfAnimal,
//       author,
//     });

//     await newQuestion.save();
//     res.status(200).json({ status: "ok", data: "Question posted" });
//   } catch (error) {
//     console.error("Error saving question:", error);
//     res.status(500).json({ status: "error", data: error.message });
//   }
// };

exports.questions = async (req, res) => {
  const { Qn, caseHistory, ageOfAnimal, typeOfAnimal, sexOfAnimal, author } =
    req.body;

  try {
    // Only map qnImage if files are present
    let qnImage = [];
    if (req.files && req.files.length > 0) {
      qnImage = req.files.map((file) => ({
        url: file.path,
        id: file.filename,
      }));
    }

    const newQuestion = new Questions({
      Qn,
      caseHistory,
      ageOfAnimal,
      typeOfAnimal,
      sexOfAnimal,
      author,
      ...(qnImage.length > 0 && { qnImage }), // only include if not empty
    });

    await newQuestion.save();
    res.status(200).json({ status: "ok", data: "Question posted" });
  } catch (error) {
    console.error("Error saving question:", error);
    res.status(500).json({ status: "error", data: error.message });
  }
};

// get questions

exports.getQuestionsForAdmin = async (request, response) => {
  try {
    const questions = await Questions.find({})
      .sort({ timestamp: -1 })
      .populate("author");

    const dataWithComments = await Promise.all(
      questions.map(async (post) => {
        const comments = await Comment.find({ postId: post._id });
        return {
          id: post._id,
          authorId: post.author?._id,
          username: post.author.username,
          authorPic: post.author.profileImage?.secure_url,
          history: post.caseHistory,
          qn: post.Qn,
          typeOfAnimal: post.typeOfAnimal,
          sexOfAnimal: post.sexOfAnimal,
          ageOfAnimal: post.ageOfAnimal,
          qnImage: post.qnImage,
          timestamp: post.timestamp,
          comments: comments?.length,
        };
      })
    );
    response.json(dataWithComments);
  } catch (error) {
    console.error("Error fetching story:", error);
    response.status(500).json({ message: "Internal server error" });
  }
  // const questions = await Questions.find({})
  //   .sort({ timestamp: -1 })
  //   .populate("author");

  // response.json(
  //   questions.map((post, index) => ({
  //     id: post._id,
  //     authorId: post.author?._id,
  //     username: post.author.username,
  //     authorPic: post.author.profileImage.secure_url,
  //     history: post.caseHistory,
  //     qn: post.Qn,
  //     typeOfAnimal: post.typeOfAnimal,
  //     sexOfAnimal: post.sexOfAnimal,
  //     ageOfAnimal: post.ageOfAnimal,
  //     qnImage: post.qnImage,
  //     timestamp: post.timestamp,
  //   }))
  // );
};

// With search Query
// exports.getQuestions = async (req, res) => {
//   try {
//     const search = req.query.search || ""; // search from query param

//     // First, get authors matching the search (case-insensitive)
//     const matchingAuthors = await User.find({
//       username: { $regex: search, $options: "i" },
//     });

//     const authorIds = matchingAuthors.map((author) => author._id);

//     // Then, get questions by those authors
//     const questions = await Questions.find({
//       ...(search && { author: { $in: authorIds } }),
//     })
//       .sort({ timestamp: -1 })
//       .populate("author");

//     const dataWithComments = await Promise.all(
//       questions.map(async (post) => {
//         const comments = await Comment.find({ postId: post._id });
//         return {
//           id: post._id,
//           authorId: post.author?._id,
//           username: post.author?.username,
//           authorPic: post.author?.profileImage?.secure_url,
//           history: post.caseHistory,
//           qn: post.Qn,
//           typeOfAnimal: post.typeOfAnimal,
//           sexOfAnimal: post.sexOfAnimal,
//           ageOfAnimal: post.ageOfAnimal,
//           qnImage: post.qnImage,
//           timestamp: post.timestamp,
//           comments: comments?.length,
//         };
//       })
//     );

//     // console.log(dataWithComments)

//     res.json(dataWithComments);
//   } catch (error) {
//     console.error("Error fetching questions:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// With search query and pagination

exports.getQuestions = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    // 1. Get authors matching the search
    const matchingAuthors = await User.find({
      username: { $regex: search, $options: "i" },
    });

    const authorIds = matchingAuthors.map((author) => author._id);

    // 2. Get questions by those authors with pagination
    const query = search ? { author: { $in: authorIds } } : {};

    const questions = await Questions.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author");

    // 3. Fetch comments for each question
    const dataWithComments = await Promise.all(
      questions.map(async (post) => {
        const comments = await Comment.find({ postId: post._id });
        return {
          id: post._id,
          authorId: post.author?._id,
          username: post.author?.username,
          authorPic: post.author?.profileImage?.secure_url,
          history: post.caseHistory,
          qn: post.Qn,
          typeOfAnimal: post.typeOfAnimal,
          sexOfAnimal: post.sexOfAnimal,
          ageOfAnimal: post.ageOfAnimal,
          qnImage: post.qnImage,
          timestamp: post.timestamp,
          comments: comments?.length,
        };
      })
    );

    res.json(dataWithComments);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add comments

exports.AddComment = async (request, response) => {
  const { postId, author, comment, replies } = request.body;

  try {
    const newComment = new Comment({
      postId,
      author,
      comment,
      replies,
    });
    await newComment.save();
    response.status(200).json({ status: "ok", data: "Comment added" });
  } catch (error) {
    response.send({ status: "error", data: error });
  }
};

// get comments

exports.getComments = async (request, response) => {
  const PostId = request.params.PostId;

  if (!PostId) {
    return response.status(400).json({ message: "Post Id required" });
  }

  try {
    const comments = await Comment.find({ postId: PostId })
      .sort({ createdAt: "desc" })
      .populate("author")
      .populate("replies.author");

    const getTimeAgo = (createdAt) => {
      const now = new Date();
      const diffInSeconds = Math.floor((now - new Date(createdAt)) / 1000);

      const days = Math.floor(diffInSeconds / (24 * 60 * 60));
      const hours = Math.floor(diffInSeconds / (60 * 60));
      const minutes = Math.floor(diffInSeconds / 60);
      const months = Math.floor(days / 30);
      const weeks = Math.floor(days / 7);

      if (months > 0) return `${months} mon ago`;
      if (weeks > 0) return `${weeks} w ago`;
      if (days > 0) return `${days} d ago`;
      if (hours > 0) return `${hours} hr ago`;
      if (minutes > 0) return `${minutes} min ago`;
      return "Just now";
    };

    const formattedComments = comments.map((post) => ({
      id: post._id,
      postId: post.postId,
      username: post.author?.username,
      authorPic: post.author?.profileImage?.secure_url,
      authorId: post.author?._id,
      comment: post.comment,
      likes: post.likes,
      replies: post.replies
        ?.filter((reply) => reply && reply.author) // filter out null authors
        .map((reply) => ({
          ...reply.toObject(),
          author: {
            _id: reply.author._id,
            username: reply.author.username,
            profileImage: reply.author.profileImage,
          },
        }))
        .reverse(),

      createAt: getTimeAgo(post.createdAt),
    }));

    return response.json(formattedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return response.status(500).json({ message: "Server Error" });
  }
};

// GEt all comments for admin panel

exports.getAllComments = async (request, response) => {
  try {
    const comments = await Comment.find()
      .sort({ createdAt: "desc" })
      .populate("author")
      .populate("replies.author");

    const formattedComments = comments.map((post) => ({
      id: post._id,
      postId: post.postId,
      username: post.author?.username,
      authorPic: post.author?.profileImage?.secure_url,
      authorId: post.author?._id,
      comment: post.comment,
      likes: post.likes,
      replies: post.replies
        ?.filter((reply) => reply && reply.author) // filter out null authors
        .map((reply) => ({
          ...reply.toObject(),
          author: {
            _id: reply.author._id,
            username: reply.author.username,
            profileImage: reply.author.profileImage,
          },
        }))
        .reverse(),

      createAt: post.createdAt,
    }));

    response.json(formattedComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    response.status(500).json({ message: "Server Error" });
  }
};

// add reply

exports.AddReply = async (request, response) => {
  const { author, reply, commentId } = request.body;

  // const comment_id= request.params.commentId
  console.log(commentId);

  try {
    if (commentId) {
      const replies = {
        author: author,
        commentId: commentId,
        reply: reply,
      };

      const newComment = await Comment.findByIdAndUpdate(
        { _id: commentId },
        { $push: { replies: replies } },
        { new: true }
      );
      await newComment.save();
    }
    response.status(200).json({ status: "ok", data: "reply added" });
  } catch (error) {
    response.send({ status: "error", data: error });
  }
};

// like

exports.Like = async (request, response) => {
  const { postId, author } = request.body;

  // console.log(postId, author)

  // const comment_id= request.params.commentId
  try {
    const newStory = await Story.findByIdAndUpdate(
      { _id: postId },
      { $push: { likes: author } },
      { new: true }
    );

    await newStory.save();
    response.status(200).json({ status: "ok", data: "like added" });
  } catch (error) {
    response.send({ status: "error", data: error });
  }
};

// Unlike

exports.unLike = async (request, response) => {
  const { postId, author } = request.body;

  // console.log(postId, author)

  // const comment_id= request.params.commentId
  try {
    const newStory = await Story.findByIdAndUpdate(
      { _id: postId },
      { $pull: { likes: author } },
      { new: true }
    );

    await newStory.save();
    response.status(200).json({ status: "ok", data: "unlike" });
  } catch (error) {
    response.send({ status: "error here", data: error });
  }
};

// Add like to a comment

exports.likeComment = async (request, response) => {
  const { postId, author } = request.body;

  // console.log(postId, author)

  // const comment_id= request.params.commentId
  try {
    const newComment = await Comment.findByIdAndUpdate(
      { _id: postId },
      { $push: { likes: author } },
      { new: true }
    );

    await newComment.save();
    response.status(200).json({ status: "ok", data: "like added" });
  } catch (error) {
    response.send({ status: "error", data: error });
  }
};

// Remove like from a comment

exports.unLikeComments = async (request, response) => {
  const { postId, author } = request.body;

  // console.log(postId, author)
  try {
    const newComment = await Comment.findByIdAndUpdate(
      { _id: postId },
      { $pull: { likes: author } },
      { new: true }
    );

    await newComment.save();
    response.status(200).json({ status: "ok", data: "unlike" });
  } catch (error) {
    response.send({ status: "error here", data: error });
  }
};

// Add bookmark
exports.Bookmark = async (request, response) => {
  const { postId, author } = request.body;

  // console.log(postId, author)

  // const comment_id= request.params.commentId
  try {
    const newStory = await Cases.findByIdAndUpdate(
      { _id: postId },
      { $push: { bookmarks: author } },
      { new: true }
    );

    await newStory.save();
    response.status(200).json({ status: "ok", data: "Bookmark added" });
  } catch (error) {
    response.send({ status: "error", data: error });
  }
};

// Remove bookmark

exports.unBookmark = async (request, response) => {
  const { postId, author } = request.body;

  // console.log(postId, author)

  // const comment_id= request.params.commentId
  try {
    const newStory = await Cases.findByIdAndUpdate(
      { _id: postId },
      { $pull: { bookmarks: author } },
      { new: true }
    );

    await newStory.save();
    response.status(200).json({ status: "ok", data: "Bookmark removed" });
  } catch (error) {
    response.send({ status: "error here", data: error });
  }
};

// Story bookmark
exports.BookmarkStory = async (request, response) => {
  const { postId, author } = request.body;

  try {
    const newStory = await Story.findByIdAndUpdate(
      { _id: postId },
      { $push: { bookmarks: author } },
      { new: true }
    );

    await newStory.save();
    response.status(200).json({ status: "ok", data: "Bookmark added" });
  } catch (error) {
    response.send({ status: "error", data: error });
  }
};

// Unbookmark story

exports.UnBookmarkStory = async (request, response) => {
  const { postId, author } = request.body;

  try {
    const newStory = await Story.findByIdAndUpdate(
      { _id: postId },
      { $pull: { bookmarks: author } },
      { new: true }
    );

    await newStory.save();
    response.status(200).json({ status: "ok", data: "Bookmark removed" });
  } catch (error) {
    response.send({ status: "error", data: error });
  }
};

// delete comment

exports.deleteComment = async (request, response) => {
  const commentId = request.params.commentId;
  console.log(commentId);
  if (commentId) {
    await Comment.findByIdAndDelete(commentId);
    response.status(200).json({ message: "comment deleted" });
  } else {
    response.status(404).json({ error: "no comment found" });
  }
};

// Delete question

exports.deleteQuestion = async (request, response) => {
  try {
    const questionId = request.params.questionId;
    console.log("Deleting Question ID:", questionId);

    // Delete all comments associated with the question
    await Comment.deleteMany({ postId: questionId });

    // Find the question
    const existedQA = await Questions.findById(questionId);
    if (!existedQA) {
      return response.status(404).json({ error: "No post found" });
    }

    // Delete images from Cloudinary if they exist
    if (existedQA.qnImage && existedQA.qnImage.length > 0) {
      await Promise.all(
        existedQA.qnImage.map(async (item) => {
          const result = await cloudinary.uploader.destroy(item.id);
          console.log(`Deleted image ${item.id}:`, result);
        })
      );
    }

    // Delete the question from the database
    await Questions.findByIdAndDelete(questionId);
    return response
      .status(200)
      .json({ message: "Question and associated images deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Delete Case or post

exports.deleteCase = async (request, response) => {
  try {
    const caseId = request.params.caseId;
    console.log("Deleting case ID:", caseId);

    // Delete all comments associated with post or case

    await Comment.deleteMany({ postId: caseId });

    // Find the question
    const existedCase = await Cases.findById(caseId);
    if (!existedCase) {
      return response.status(404).json({ error: "No post found" });
    }

    // Delete images from Cloudinary if they exist
    if (existedCase.caseImage && existedCase.caseImage.length > 0) {
      await Promise.all(
        existedCase.caseImage.map(async (item) => {
          const result = await cloudinary.uploader.destroy(item.id);
          console.log(`Deleted image ${item.id}:`, result);
        })
      );
    }

    // Delete the Case from the database
    await Cases.findByIdAndDelete(caseId);
    return response
      .status(200)
      .json({ message: "Case and associated images deleted successfully" });
  } catch (error) {
    console.error("Error deleting case:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Delete Thread

exports.deleteThread = async (req, res) => {
  try {
    const threadId = req.params.threadId;
    console.log("Deleting case ID:", threadId);

    await Comment.deleteMany({ postId: threadId });

    const existedThread = await Thread.findById(threadId);
    if (!existedThread) {
      return res.status(404).json({ error: "No thread found" });
    }

    for (const tweet of existedThread.tweets) {
      if (tweet.imageUrl) {
        const parts = tweet.imageUrl.split("/");
        const filename = parts[parts.length - 1];
        const publicId = filename.split(".")[0];

        const result = await cloudinary.uploader.destroy(
          `twitterThreads/${publicId}`
        );
        console.log(`Deleted image ${publicId}:`, result);
      }
    }

    await Thread.findByIdAndDelete(threadId);

    res
      .status(200)
      .json({ message: "Thread and associated images deleted successfully" });
  } catch (error) {
    console.error("Error deleting thread:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// recent Q & a

exports.recentQA = async (request, response) => {
  const RecentQuestions = await Questions.find({})
    .sort({ timestamp: -1 })
    .populate("author")
    .limit(4);

  response.json(
    RecentQuestions.map((post, index) => ({
      id: post._id,
      authorId: post.author?._id,
      username: post.author.username,
      authorPic: post.author.profileImage?.secure_url,
      history: post.caseHistory,
      qn: post.Qn,
      typeOfAnimal: post.typeOfAnimal,
      sexOfAnimal: post.sexOfAnimal,
      ageOfAnimal: post.ageOfAnimal,
      qnImage: post.qnImage,
      timestamp: post.timestamp,
    }))
  );
};

// My Q & A

exports.MyQA = async (request, response) => {
  const authorId = request.params.authorId;
  const RecentQuestions = await Questions.find({ author: authorId })
    .sort({ timestamp: -1 })
    .populate("author");
  response.json(
    RecentQuestions.map((post, index) => ({
      id: post._id,
      authorId: post.author?._id,
      username: post.author.username,
      authorPic: post.author.profileImage?.secure_url,
      history: post.caseHistory,
      qn: post.Qn,
      typeOfAnimal: post.typeOfAnimal,
      sexOfAnimal: post.sexOfAnimal,
      ageOfAnimal: post.ageOfAnimal,
      qnImage: post.qnImage,
      timestamp: post.timestamp,
    }))
  );
};

// create cases

// exports.Cases = async (request, response) => {
//   const {
//     author,
//     category,
//     caseTitle,
//     typeOfAnimal,
//     sexOfAnimal,
//     ageOfAnimal,
//     caseHistory,
//     clinicalFindings,
//     clinicalManagement,
//     drugsUsed,
//     DifferentialDiagnosis,
//     VaccineAgainst,
//     VaccinationRegime,
//     TypeOfVaccine,
//     managementCategory,
//     description,
//     TentativeDiagnosis,
//     recommendations,
//     ProceduralSteps,
//     Poc,
//     caseImage,
//   } = request.body;
//   try {
//     if (request.file) {

//       (request.file).map(async(item)=>{
//         const { secure_url: url, id } = await Cloudinary.uploader.upload(
//           item.path
//         );
//         newPost.caseImage = { url, id };
//       })
//     }
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
//       caseImage,
//     });
//     await newPost.save();
//     response.status(200).json({ status: "ok", data: "Post added" });
//   } catch (error) {
//     response.send({ status: "error", data: error });
//   }
// };

exports.Cases = async (request, response) => {
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
    caseImage,
  } = request.body;

  try {
    let imageUploads = [];

    // if we have files from pc

    if (!caseImage) {
      console.log("files =>", request.files);
      if (request.files && request.files.length > 0) {
        imageUploads = await Promise.all(
          request.files.map(async (file) => {
            const { secure_url: url, public_id: id } =
              await cloudinary.uploader.upload(file.path);
            return { url, id };
          })
        );
      }

      console.log("image upload in case =>", imageUploads);

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
        caseImage: imageUploads, // now storing all image objects
      });
      await newPost.save();
    }

    if (caseImage) {
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
        caseImage,
      });
      await newPost.save();
    }

    response.status(200).json({ status: "ok", data: "Post added" });
  } catch (error) {
    response.status(500).json({ status: "error", message: error.message });
  }
};

// get cases

// exports.getCase = async (request, response) => {
//   const { animal, category } = request.query;
//   // console.log("animal =>",animal)
//   // console.log("category =>",category)
//   const cases = await Cases.find({
//     typeOfAnimal: animal.toLowerCase(),
//     category: category,
//   })
//     .sort({ createdAt: -1 })
//     .populate("author");

//   response.json(
//     cases.map((post, index) => ({
//       id: post._id,
//       author: post.author._id,
//       bookmarks: post.bookmarks,
//       username: post.author.username,
//       authorPic: post.author.profileImage.secure_url,
//       category: post.category,
//       caseTitle: post.caseTitle,
//       typeOfAnimal: post.typeOfAnimal,
//       sexOfAnimal: post.sexOfAnimal,
//       ageOfAnimal: post.ageOfAnimal,
//       caseHistory: post.caseHistory,
//       clinicalFindings: post.clinicalFindings,
//       clinicalManagement: post.clinicalManagement,
//       drugsUsed: post.drugsUsed,
//       DifferentialDiagnosis: post.DifferentialDiagnosis,
//       VaccineAgainst: post.VaccineAgainst,
//       VaccinationRegime: post.VaccinationRegime,
//       TypeOfVaccine: post.TypeOfVaccine,
//       managementCategory: post.managementCategory,
//       description: post.description,
//       TentativeDiagnosis: post.TentativeDiagnosis,
//       recommendations: post.recommendations,
//       ProceduralSteps: post.ProceduralSteps,
//       Poc: post.Poc,
//       caseImage: post.caseImage,
//       createdAt: post.createdAt,
//     }))
//   );
// };

// Cases with pagination

exports.getCase = async (request, response) => {
  try {
    const { animal, category, page = 1, limit = 5 } = request.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      typeOfAnimal: animal.toLowerCase(),
      category: category,
    };

    const cases = await Cases.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("author");

    response.json(
      cases.map((post) => ({
        id: post._id,
        author: post.author._id,
        bookmarks: post.bookmarks,
        username: post.author.username,
        authorPic: post.author.profileImage?.secure_url,
        category: post.category,
        caseTitle: post.caseTitle,
        typeOfAnimal: post.typeOfAnimal,
        sexOfAnimal: post.sexOfAnimal,
        ageOfAnimal: post.ageOfAnimal,
        caseHistory: post.caseHistory,
        clinicalFindings: post.clinicalFindings,
        clinicalManagement: post.clinicalManagement,
        drugsUsed: post.drugsUsed,
        DifferentialDiagnosis: post.DifferentialDiagnosis,
        VaccineAgainst: post.VaccineAgainst,
        VaccinationRegime: post.VaccinationRegime,
        TypeOfVaccine: post.TypeOfVaccine,
        managementCategory: post.managementCategory,
        description: post.description,
        TentativeDiagnosis: post.TentativeDiagnosis,
        recommendations: post.recommendations,
        ProceduralSteps: post.ProceduralSteps,
        Poc: post.Poc,
        caseImage: post.caseImage,
        createdAt: post.createdAt,
      }))
    );
  } catch (error) {
    console.error("Error fetching cases:", error);
    response.status(500).json({ message: "Internal server error" });
  }
};

// get Case by id this for the admin panel

exports.getCaseById = async (request, response) => {
  const { postId } = request.params;

  try {
    // Fetch the post by ID and populate the author data
    const post = await Cases.findById(postId).populate("author");

    if (!post) {
      return response.status(404).json({ message: "Case not found" });
    }

    // Send the response with the case details
    response.json({
      id: post._id,
      author: post.author._id,
      bookmarks: post.bookmarks,
      username: post.author.username,
      authorPic: post.author.profileImage?.secure_url,
      category: post.category,
      caseTitle: post.caseTitle,
      typeOfAnimal: post.typeOfAnimal,
      sexOfAnimal: post.sexOfAnimal,
      ageOfAnimal: post.ageOfAnimal,
      caseHistory: post.caseHistory,
      clinicalFindings: post.clinicalFindings,
      clinicalManagement: post.clinicalManagement,
      drugsUsed: post.drugsUsed,
      DifferentialDiagnosis: post.DifferentialDiagnosis,
      VaccineAgainst: post.VaccineAgainst,
      VaccinationRegime: post.VaccinationRegime,
      TypeOfVaccine: post.TypeOfVaccine,
      managementCategory: post.managementCategory,
      description: post.description,
      TentativeDiagnosis: post.TentativeDiagnosis,
      recommendations: post.recommendations,
      ProceduralSteps: post.ProceduralSteps,
      Poc: post.Poc,
      caseImage: post.caseImage,
      createdAt: post.createdAt,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Error fetching case details" });
  }
};

// get Question by Id

exports.getQuestionById = async (request, response) => {
  const { postId } = request.params;

  try {
    // Fetch the post by ID and populate the author data
    const post = await Questions.findById(postId).populate("author");

    if (!post) {
      return response.status(404).json({ message: "Question not found" });
    }

    // Send the response with the case details
    response.json({
      id: post._id,
      authorId: post.author?._id,
      username: post.author.username,
      authorPic: post.author.profileImage?.secure_url,
      history: post.caseHistory,
      qn: post.Qn,
      typeOfAnimal: post.typeOfAnimal,
      sexOfAnimal: post.sexOfAnimal,
      ageOfAnimal: post.ageOfAnimal,
      qnImage: post.qnImage,
      timestamp: post.timestamp,
      // comments:comments?.length
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Error fetching question details" });
  }
};

// Recent cases

// exports.RecentCase = async (request, response) => {
//   try {
//     const cases = await Cases.find().sort({ createdAt: -1 }).populate("author");

//     const dataWithComments = await Promise.all(
//       cases.map(async (post) => {
//         const comments = await Comment.find({ postId: post._id }); // or postId depending on your schema

//         return {
//           id: post._id,
//           author: post.author._id,
//           bookmarks: post.bookmarks,
//           username: post.author.username,
//           authorPic: post.author.profileImage?.secure_url,
//           category: post.category,
//           caseTitle: post.caseTitle,
//           typeOfAnimal: post.typeOfAnimal,
//           sexOfAnimal: post.sexOfAnimal,
//           ageOfAnimal: post.ageOfAnimal,
//           caseHistory: post.caseHistory,
//           clinicalFindings: post.clinicalFindings,
//           clinicalManagement: post.clinicalManagement,
//           drugsUsed: post.drugsUsed,
//           DifferentialDiagnosis: post.DifferentialDiagnosis,
//           VaccineAgainst: post.VaccineAgainst,
//           VaccinationRegime: post.VaccinationRegime,
//           TypeOfVaccine: post.TypeOfVaccine,
//           managementCategory: post.managementCategory,
//           description: post.description,
//           TentativeDiagnosis: post.TentativeDiagnosis,
//           recommendations: post.recommendations,
//           ProceduralSteps: post.ProceduralSteps,
//           Poc: post.Poc,
//           caseImage: post.caseImage,
//           createdAt: post.createdAt,
//           comments: comments?.length, // or send full comments if needed
//         };
//       })
//     );

//     response.json(dataWithComments);
//   } catch (error) {
//     console.error("Error fetching recent cases:", error);
//     response.status(500).json({ message: "Internal server error" });
//   }

//   // response.json(
//   //   cases.map((post, index) => (
//   //     const comments= await Comment.findById(cases._id)

//   //     {
//   //     id: post._id,
//   //     author: post.author._id,
//   //     bookmarks: post.bookmarks,
//   //     username: post.author.username,
//   //     authorPic: post.author.profileImage.secure_url,
//   //     category: post.category,
//   //     caseTitle: post.caseTitle,
//   //     typeOfAnimal: post.typeOfAnimal,
//   //     sexOfAnimal: post.sexOfAnimal,
//   //     ageOfAnimal: post.ageOfAnimal,
//   //     caseHistory: post.caseHistory,
//   //     clinicalFindings: post.clinicalFindings,
//   //     clinicalManagement: post.clinicalManagement,
//   //     drugsUsed: post.drugsUsed,
//   //     DifferentialDiagnosis: post.DifferentialDiagnosis,
//   //     VaccineAgainst: post.VaccineAgainst,
//   //     VaccinationRegime: post.VaccinationRegime,
//   //     TypeOfVaccine: post.TypeOfVaccine,
//   //     managementCategory: post.managementCategory,
//   //     description: post.description,
//   //     TentativeDiagnosis: post.TentativeDiagnosis,
//   //     recommendations: post.recommendations,
//   //     ProceduralSteps: post.ProceduralSteps,
//   //     Poc: post.Poc,
//   //     caseImage: post.caseImage,
//   //     createdAt: post.createdAt,
//   //     comments
//   //   }))
//   // );
// };

// Recent cases with pagination for infinite scrolling

exports.RecentCase = async (request, response) => {
  try {
    const { category, page, limit } = request.query;

    // Convert `page` and `limit` to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Calculate the skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Determine query filter based on category
    let query = {};
    if (category) {
      query.typeOfAnimal = category; // Only fetch cases for the selected category
    }

    // Fetch the cases based on the query filter with pagination
    const cases = await Cases.find(query)
      .sort({ createdAt: -1 })
      .skip(skip) // Skips the previous pages' records
      .limit(limitNum) // Limits the number of records per page
      .populate("author");

    // Map the results to match the response format
    const dataWithComments = await Promise.all(
      cases.map(async (post) => {
        const comments = await Comment.find({ postId: post._id });

        return {
          id: post._id,
          author: post.author._id,
          bookmarks: post.bookmarks,
          username: post.author.username,
          authorPic: post.author.profileImage?.secure_url,
          category: post.category,
          caseTitle: post.caseTitle,
          typeOfAnimal: post.typeOfAnimal,
          sexOfAnimal: post.sexOfAnimal,
          ageOfAnimal: post.ageOfAnimal,
          caseHistory: post.caseHistory,
          clinicalFindings: post.clinicalFindings,
          clinicalManagement: post.clinicalManagement,
          drugsUsed: post.drugsUsed,
          DifferentialDiagnosis: post.DifferentialDiagnosis,
          VaccineAgainst: post.VaccineAgainst,
          VaccinationRegime: post.VaccinationRegime,
          TypeOfVaccine: post.TypeOfVaccine,
          managementCategory: post.managementCategory,
          description: post.description,
          TentativeDiagnosis: post.TentativeDiagnosis,
          recommendations: post.recommendations,
          ProceduralSteps: post.ProceduralSteps,
          Poc: post.Poc,
          caseImage: post.caseImage,
          createdAt: post.createdAt,
          comments: comments?.length,
        };
      })
    );

    // Send the paginated cases data back
    response.json(dataWithComments);
  } catch (error) {
    console.error("Error fetching recent cases:", error);
    response.status(500).json({ message: "Internal server error" });
  }
};

// Recent case catagory with pagination

// exports.recentCaseCategory = async (request, response) => {
//   try {
//     const { category, page = 1, limit = 10 } = request.query;

//     // Convert `page` and `limit` to numbers
//     const pageNum = parseInt(page, 10);
//     const limitNum = parseInt(limit, 10);

//     // Calculate the skip value for pagination
//     const skip = (pageNum - 1) * limitNum;

//     // Fetch the cases by category with pagination
//     const cases = await Cases.find({ typeOfAnimal: category })
//       .sort({ createdAt: -1 })
//       .skip(skip)  // Skips the previous pages' records
//       .limit(limitNum) // Limits the number of records per page
//       .populate("author");

//     // Send the fetched cases back as a response
//     const data = cases.map((post) => ({
//       id: post._id,
//       author: post.author._id,
//       username: post.author.username,
//       bookmarks: post.bookmarks,
//       authorPic: post.author.profileImage?.secure_url,
//       category: post.category,
//       caseTitle: post.caseTitle,
//       typeOfAnimal: post.typeOfAnimal,
//       sexOfAnimal: post.sexOfAnimal,
//       ageOfAnimal: post.ageOfAnimal,
//       caseHistory: post.caseHistory,
//       clinicalFindings: post.clinicalFindings,
//       clinicalManagement: post.clinicalManagement,
//       drugsUsed: post.drugsUsed,
//       DifferentialDiagnosis: post.DifferentialDiagnosis,
//       VaccineAgainst: post.VaccineAgainst,
//       VaccinationRegime: post.VaccinationRegime,
//       TypeOfVaccine: post.TypeOfVaccine,
//       managementCategory: post.managementCategory,
//       description: post.description,
//       TentativeDiagnosis: post.TentativeDiagnosis,
//       recommendations: post.recommendations,
//       ProceduralSteps: post.ProceduralSteps,
//       Poc: post.Poc,
//       caseImage: post.caseImage,
//       createdAt: post.createdAt,
//     }));

//     // Send the paginated cases data back
//     response.json(data);
//   } catch (error) {
//     console.error("Error fetching cases for category:", error);
//     response.status(500).json({ message: "Internal server error" });
//   }
// };

exports.recentCaseCategory = async (request, response) => {
  try {
    const { category, page, limit } = request.query;

    // Convert `page` and `limit` to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Calculate the skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Determine query filter based on category
    let query = {};
    if (category) {
      query.typeOfAnimal = category; // Only fetch cases for the selected category
    }

    // Fetch the cases based on the query filter with pagination
    const cases = await Cases.find(query)
      .sort({ createdAt: -1 })
      .skip(skip) // Skips the previous pages' records
      .limit(limitNum) // Limits the number of records per page
      .populate("author");

    // Map the results to match the response format
    const data = cases.map((post) => ({
      id: post._id,
      author: post.author._id,
      username: post.author.username,
      bookmarks: post.bookmarks,
      authorPic: post.author.profileImage?.secure_url,
      category: post.category,
      caseTitle: post.caseTitle,
      typeOfAnimal: post.typeOfAnimal,
      sexOfAnimal: post.sexOfAnimal,
      ageOfAnimal: post.ageOfAnimal,
      caseHistory: post.caseHistory,
      clinicalFindings: post.clinicalFindings,
      clinicalManagement: post.clinicalManagement,
      drugsUsed: post.drugsUsed,
      DifferentialDiagnosis: post.DifferentialDiagnosis,
      VaccineAgainst: post.VaccineAgainst,
      VaccinationRegime: post.VaccinationRegime,
      TypeOfVaccine: post.TypeOfVaccine,
      managementCategory: post.managementCategory,
      description: post.description,
      TentativeDiagnosis: post.TentativeDiagnosis,
      recommendations: post.recommendations,
      ProceduralSteps: post.ProceduralSteps,
      Poc: post.Poc,
      caseImage: post.caseImage,
      createdAt: post.createdAt,
    }));

    // Send the paginated cases data back
    response.json(data);
  } catch (error) {
    console.error("Error fetching cases for category:", error);
    response.status(500).json({ message: "Internal server error" });
  }
};

// Recent case by animal category

// exports.recentCaseCategory = async (request, response) => {
//   const { category } = request.query;
//   const cases = await Cases.find({ typeOfAnimal: category })
//     .sort({ createdAt: -1 })
//     .populate("author");
//   response.json(
//     cases.map((post, index) => ({
//       id: post._id,
//       author: post.author._id,
//       username: post.author.username,
//       bookmarks: post.bookmarks,
//       authorPic: post.author.profileImage.secure_url,
//       category: post.category,
//       caseTitle: post.caseTitle,
//       typeOfAnimal: post.typeOfAnimal,
//       sexOfAnimal: post.sexOfAnimal,
//       ageOfAnimal: post.ageOfAnimal,
//       caseHistory: post.caseHistory,
//       clinicalFindings: post.clinicalFindings,
//       clinicalManagement: post.clinicalManagement,
//       drugsUsed: post.drugsUsed,
//       DifferentialDiagnosis: post.DifferentialDiagnosis,
//       VaccineAgainst: post.VaccineAgainst,
//       VaccinationRegime: post.VaccinationRegime,
//       TypeOfVaccine: post.TypeOfVaccine,
//       managementCategory: post.managementCategory,
//       description: post.description,
//       TentativeDiagnosis: post.TentativeDiagnosis,
//       recommendations: post.recommendations,
//       ProceduralSteps: post.ProceduralSteps,
//       Poc: post.Poc,
//       caseImage: post.caseImage,
//       createdAt: post.createdAt,
//     }))
//   );
// };

// My cases

exports.MyCase = async (request, response) => {
  const authorId = request.params.authorId;
  const cases = await Cases.find({ author: authorId })
    .sort({ createdAt: -1 })
    .populate("author");
  response.json(
    cases.map((post, index) => ({
      id: post._id,
      author: post.author._id,
      bookmarks: post.bookmarks,
      username: post.author.username,
      authorPic: post.author.profileImage?.secure_url,
      category: post.category,
      caseTitle: post.caseTitle,
      typeOfAnimal: post.typeOfAnimal,
      sexOfAnimal: post.sexOfAnimal,
      ageOfAnimal: post.ageOfAnimal,
      caseHistory: post.caseHistory,
      clinicalFindings: post.clinicalFindings,
      clinicalManagement: post.clinicalManagement,
      drugsUsed: post.drugsUsed,
      DifferentialDiagnosis: post.DifferentialDiagnosis,
      VaccineAgainst: post.VaccineAgainst,
      VaccinationRegime: post.VaccinationRegime,
      TypeOfVaccine: post.TypeOfVaccine,
      managementCategory: post.managementCategory,
      description: post.description,
      TentativeDiagnosis: post.TentativeDiagnosis,
      recommendations: post.recommendations,
      ProceduralSteps: post.ProceduralSteps,
      Poc: post.Poc,
      caseImage: post.caseImage,
      createdAt: post.createdAt,
    }))
  );
};

// Related cases

exports.RelatedCases = async (request, response) => {
  const { animal, category, author, postId } = request.query;
  // console.log(postId,author,category,postId)

  if (author) {
    const relatedPost = await Cases.find({
      typeOfAnimal: animal.toLowerCase(),
      category: category,
      author: author,
      _id: { $ne: postId },
    })
      .sort({ createdAt: -1 })
      .populate("author");
    response.json(
      relatedPost.map((post, index) => ({
        id: post._id,
        author: post.author._id,
        username: post.author.username,
        authorPic: post.author.profileImage?.secure_url,
        category: post.category,
        caseTitle: post.caseTitle,
        typeOfAnimal: post.typeOfAnimal,
        sexOfAnimal: post.sexOfAnimal,
        ageOfAnimal: post.ageOfAnimal,
        caseHistory: post.caseHistory,
        clinicalFindings: post.clinicalFindings,
        clinicalManagement: post.clinicalManagement,
        drugsUsed: post.drugsUsed,
        DifferentialDiagnosis: post.DifferentialDiagnosis,
        VaccineAgainst: post.VaccineAgainst,
        VaccinationRegime: post.VaccinationRegime,
        TypeOfVaccine: post.TypeOfVaccine,
        managementCategory: post.managementCategory,
        description: post.description,
        TentativeDiagnosis: post.TentativeDiagnosis,
        recommendations: post.recommendations,
        ProceduralSteps: post.ProceduralSteps,
        Poc: post.Poc,
        caseImage: post.caseImage,
        createdAt: post.createdAt,
      }))
    );
  } else {
    return;
  }

  // response.json({ relatedPost });
};

// Search category

exports.Search = async (request, response) => {
  const { title, animal } = request.query;
  // console.log(title)
  if (!title?.trim()) {
    return response.status(401).json({ error: "search query is missing!" });
  }

  if (title) {
    const searchedPost = await Cases.find({
      caseTitle: { $regex: title.toLowerCase(), $options: "i" },
      typeOfAnimal: animal.toLowerCase(),
    }).populate("author");

    return response.status(200).json(
      searchedPost.map((post, index) => ({
        // status:200,
        id: post._id,
        author: post.author._id,
        username: post.author.username,
        bookmarks: post.bookmarks,
        authorPic: post.author.profileImage?.secure_url,
        category: post.category,
        caseTitle: post.caseTitle,
        typeOfAnimal: post.typeOfAnimal,
        sexOfAnimal: post.sexOfAnimal,
        ageOfAnimal: post.ageOfAnimal,
        caseHistory: post.caseHistory,
        clinicalFindings: post.clinicalFindings,
        clinicalManagement: post.clinicalManagement,
        drugsUsed: post.drugsUsed,
        DifferentialDiagnosis: post.DifferentialDiagnosis,
        VaccineAgainst: post.VaccineAgainst,
        VaccinationRegime: post.VaccinationRegime,
        TypeOfVaccine: post.TypeOfVaccine,
        managementCategory: post.managementCategory,
        description: post.description,
        TentativeDiagnosis: post.TentativeDiagnosis,
        recommendations: post.recommendations,
        ProceduralSteps: post.ProceduralSteps,
        Poc: post.Poc,
        caseImage: post.caseImage,
        createdAt: post.createdAt,
      }))
    );
  }
};

// Search All

exports.SearchAll = async (request, response) => {
  const { title } = request.query;
  // console.log(title)
  if (!title?.trim()) {
    return response.status(401).json({ error: "search query is missing!" });
  }

  if (title) {
    const searchedPost = await Cases.find({
      caseTitle: { $regex: title.toLowerCase(), $options: "i" },
    }).populate("author");

    return response.status(200).json(
      searchedPost.map((post, index) => ({
        // status:200,
        id: post._id,
        author: post.author._id,
        username: post.author.username,
        bookmarks: post.bookmarks,
        authorPic: post.author.profileImage?.secure_url,
        category: post.category,
        caseTitle: post.caseTitle,
        typeOfAnimal: post.typeOfAnimal,
        sexOfAnimal: post.sexOfAnimal,
        ageOfAnimal: post.ageOfAnimal,
        caseHistory: post.caseHistory,
        clinicalFindings: post.clinicalFindings,
        clinicalManagement: post.clinicalManagement,
        drugsUsed: post.drugsUsed,
        DifferentialDiagnosis: post.DifferentialDiagnosis,
        VaccineAgainst: post.VaccineAgainst,
        VaccinationRegime: post.VaccinationRegime,
        TypeOfVaccine: post.TypeOfVaccine,
        managementCategory: post.managementCategory,
        description: post.description,
        TentativeDiagnosis: post.TentativeDiagnosis,
        recommendations: post.recommendations,
        ProceduralSteps: post.ProceduralSteps,
        Poc: post.Poc,
        caseImage: post.caseImage,
        createdAt: post.createdAt,
      }))
    );
  }
};

// Total users with their data

exports.TotalUsers = async (request, response) => {
  try {
    const users = await User.find();

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalCases = await Cases.countDocuments({ author: user._id });
        const totalStories = await Story.countDocuments({ author: user._id });
        const totalQAs = await Questions.countDocuments({ author: user._id });

        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profileImage: user?.profileImage,
          timestamp: user.timestamp,
          totalCases,
          totalStories,
          totalQAs,
        };
      })
    );

    response.json(usersWithStats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    response.status(500).json({ error: "Server error" });
  }
};

// Delete user with all their data

exports.DeleteUser = async (request, response) => {
  const { userId } = request.params;

  try {
    // 1. Delete all cases associated with the user
    await Cases.deleteMany({ author: userId });

    // 2. Delete all stories associated with the user
    await Story.deleteMany({ author: userId });

    // 3. Delete all community Q&A associated with the user
    await Questions.deleteMany({ author: userId });

    // 4. Delete all comments
    await Comment.deleteMany({ author: userId });

    // 4. Delete the user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    response
      .status(200)
      .json({ message: "User and all related data deleted successfully" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: "Server error" });
  }
};

// Send Otp

exports.Otp = async (request, response) => {
  // Route to send OTP

  const { emailOrPhone } = request.body;
  if (!emailOrPhone) {
    return response
      .status(400)
      .send({ status: "error", message: "Email or phone is required" });
  }

  // Generate a 6-digit OTP
  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    specialChars: false,
    alphabets: false,
  });

  console.log(`Generated OTP for ${emailOrPhone}:`, otp);

  // Here you can decide: if email => send email, if phone => send SMS
  if (emailOrPhone.includes("@")) {
    // Send via Email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "chordata.vet@gmail.com",
        pass: "cpya jzky fqxm fdau ",
        // user: "kephapatrick8@gmail.com", // your email
        // pass: "keos zmpa olit rbuk ", // your email password or app password
      },
    });

    const mailOptions = {
      // from: "kephapatrick8@gmail.com",
      from: "chordata.vet@gmail.com",
      to: emailOrPhone,
      subject: "Your Chordata OTP Code",
      text: `
Hi ${emailOrPhone},

Thank you for using Chordata. 

Your One-Time Password (OTP) is: ${otp}

Please use this OTP to complete your login process. This code is valid for 10 minutes.

If you did not request this, please ignore this email.

Regards,
The Chordata Team
`,
    };

    try {
      await transporter.sendMail(mailOptions);
      response.status(200).send({ status: "ok", otp }); // Return OTP for now (in production, don't send it back)
    } catch (error) {
      console.error(error);
      response
        .status(500)
        .send({ status: "error", message: "Failed to send OTP by email" });
    }
  } else {
    // Send via SMS
    // You can integrate Twilio, or SMS API provider here
    response.status(200).send({ status: "ok", otp });
  }
};

// All cases

exports.getAllCase = async (request, response) => {
  try {
    const cases = await Cases.find().sort({ createdAt: -1 }).populate("author");

    const dataWithComments = await Promise.all(
      cases.map(async (post) => {
        const comments = await Comment.find({ postId: post._id }); // or postId depending on your schema

        return {
          id: post._id,
          author: post.author._id,
          bookmarks: post.bookmarks,
          username: post.author.username,
          authorPic: post.author.profileImage?.secure_url,
          category: post.category,
          caseTitle: post.caseTitle,
          typeOfAnimal: post.typeOfAnimal,
          sexOfAnimal: post.sexOfAnimal,
          ageOfAnimal: post.ageOfAnimal,
          caseHistory: post.caseHistory,
          clinicalFindings: post.clinicalFindings,
          clinicalManagement: post.clinicalManagement,
          drugsUsed: post.drugsUsed,
          DifferentialDiagnosis: post.DifferentialDiagnosis,
          VaccineAgainst: post.VaccineAgainst,
          VaccinationRegime: post.VaccinationRegime,
          TypeOfVaccine: post.TypeOfVaccine,
          managementCategory: post.managementCategory,
          description: post.description,
          TentativeDiagnosis: post.TentativeDiagnosis,
          recommendations: post.recommendations,
          ProceduralSteps: post.ProceduralSteps,
          Poc: post.Poc,
          caseImage: post.caseImage,
          createdAt: post.createdAt,
          comments: comments?.length, // or send full comments if needed
        };
      })
    );

    response.json(dataWithComments);
  } catch (error) {
    console.error("Error fetching recent cases:", error);
    response.status(500).json({ message: "Internal server error" });
  }
};

// End point to access all users except current login user

exports.chartRoomUsers = async (request,response) =>{
  const logInUserId= request.params.userId;

  // console.log(logInUserId)

  User.find({_id:{$ne:logInUserId}}).then((users)=>{
    response.status(200).json(users)
    // console.log(users)
  }).catch ((error)=> {
    console.error("Error fetching recent cases:", error);
    response.status(500).json({ message: "error retrieving users" });
  })
}


//  end point for messages


exports.Messages = async (request, response) => {
  const { senderId, recepientId, messageType, message } = request.body;


  let imageUrl= null
  
  
  if (messageType === "image" && request.file) {
    const url={url:request.file.path, public_id: request.file.filename}
    imageUrl= url
    }

    
  try {

    const newMessage = new Message({
      senderId:senderId,
      recepientId:recepientId,
      messageType:messageType,
      message: messageType === "text" ? message : "",
      timestamp: new Date(),
      imageUrl: "" || imageUrl,
    });

    await newMessage.save();

    response.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error saving message:", error);
    response.status(500).json({ message: "Internal server error" });
  }
};


exports.ChatHeader = async (request, response) => {
  try {
    const { userId } = request.params;

    // console.log("recipient Id", userId);

    const recipient = await User.findById(userId);  // ✅ Await the result

    // console.log(recipient);

    response.json( recipient );  // ✅ Use .json() with plain object
  } catch (error) {
    console.error("Error fetching recent cases:", error);
    response.status(500).json({ message: "Internal server error" });
  }
};


// Get convo btn two users

exports.getConvo = async (request, response) =>{
  try {
    const {recepientId, senderId} = request.params

    const messages= await Message.find({
      $or:[
        {senderId:senderId, recepientId:recepientId},
        {senderId:recepientId, recepientId:senderId}
      ]
    }).populate("senderId", "_id")

    response.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error);
    response.status(500).json({ message: "internal server error" });
  }
}

// Get inBox

// exports.InBox = async (request, response) => {
//   try {
//     const { userId } = request.params;

//     const messages = await Message.find({
//       $or: [
//         { senderId: userId },
//         { recepientId: userId }
//       ]
//     })
//       .populate("senderId", "_id")
//       .populate("recepientId", "_id");

//     response.json(messages);
//   } catch (error) {
//     console.error("Error fetching inbox:", error);
//     response.status(500).json({ message: "Internal server error" });
//   }
// };

exports.InBox = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { recepientId: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
              "$recepientId",
              "$senderId"
            ]
          }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: "$otherUser",
          message: { $first: "$message" },
          timestamp: { $first: "$timestamp" },
          senderId: { $first: "$senderId" },
          recepientId: { $first: "$recepientId" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$recepientId", new mongoose.Types.ObjectId(userId)] },
                    { $eq: ["$isRead", false] }
                  ]
                },
                1,
                0
              ]
            }
          },
          fullDoc: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: ["$fullDoc", { unreadCount: "$unreadCount" }] } }
      }
    ]);

    await Message.populate(messages, [
      { path: "senderId", select: "_id" },
      { path: "recipientId", select: "_id" }
    ]);

    // total unread messages

     const totalUnreadCount = await Message.countDocuments({
      recepientId: userId,
      isRead: false
    });

    res.json({messages, totalUnreadCount});
  } catch (err) {
    console.error("Error fetching inbox:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Mark unread messages

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;

    // console.log(userId,otherUserId)

    const result= await Message.updateMany(
      {
        senderId: otherUserId,
        recepientId: userId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    // console.log("results", result)
    
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete messages

// exports.DeleteMessage = async (req, response)=>{
//   const {messages} = req.body

//   console.log(messages)
//   try {
//     if(!Array.isArray(messages) || messages.length ===0){
//       return response.status(400).json({message: "Invalid request body"})
//     }
//     await Message.deleteMany({_id:{$in:messages}})

//     response.status(200).json("Message deleted successfully")
//   } catch (error) {
//     console.log(error)
//     response.status(500).json({error:"internal server error"})
//   }
// }


exports.DeleteMessage = async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    // 1. Find messages before deleting
    const messageDocs = await Message.find({ _id: { $in: messages } });

    // 2. Delete Cloudinary images for image messages
    const deleteImagePromises = messageDocs
      .filter((msg) => msg.messageType === "image" && msg.imageUrl?.public_id)
      .map((msg) => cloudinary.uploader.destroy(msg.imageUrl.public_id));

    await Promise.all(deleteImagePromises);

    // 3. Delete messages from DB
    await Message.deleteMany({ _id: { $in: messages } });

    res.status(200).json({ message: "Messages deleted successfully" });
  } catch (error) {
    console.error("Error deleting messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
