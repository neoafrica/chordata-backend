const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const Thread = require('../DataBase/Thread');

const Comment = require("../DataBase/Comments");

const upload = multer({ storage });
const router = express.Router();
const mongoose = require("mongoose");


// exports.createThread = async (req, res) => {
//     try {
//       console.log("BODY:", req.body);
//       console.log("FILES:", req.files);
  
//       const tweetsField = Array.isArray(req.body.tweets) ? req.body.tweets[0] : req.body.tweets;
//       const parsedTweets = JSON.parse(tweetsField);
  
//       const imageFiles = req.files?.images || [];
  
//       const finalTweets = parsedTweets.map((tweet, index) => ({
//         text: tweet.text,
//         imageUrl: imageFiles[index]?.path || null,
//       }));
  
//       const thread = new Thread({ tweets: finalTweets });
//       await thread.save();
  
//       res.status(201).json({ message: 'Thread posted', thread });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: 'Error posting thread' });
//     }
//   };

exports.createThread = async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);
  
      if (!req.body.author) {
        return res.status(400).json({ message: "Author ID is required" });
      }
  
      const tweetsField = Array.isArray(req.body.tweets)
        ? req.body.tweets[0]
        : req.body.tweets;
  
      const parsedTweets = JSON.parse(tweetsField);
  
      const imageFiles = Array.isArray(req.files?.images)
        ? req.files.images
        : req.files?.images
        ? [req.files.images]
        : [];
  
      const finalTweets = parsedTweets.map((tweet, index) => ({
        text: tweet.text,
        imageUrl: imageFiles[index]?.path || null, // Change to `.location` or `.secure_url` if needed
      }));
  
      const thread = new Thread({
        author: req.body.author,
        tweets: finalTweets,
      });
  
      await thread.save();
  
      res.status(201).json({ message: "Thread posted", thread });
    } catch (err) {
      console.error("Error posting thread:", err);
      res.status(500).json({ message: "Error posting thread" });
    }
  };

exports.getThreads = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;

    const query = userId ? { author: userId } : {};

    const threads = await Thread.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("author");

    const total = await Thread.countDocuments(query);

    const simplifiedThreads = await Promise.all(
      threads.map(async (post) => {
        const commentCount = await Comment.countDocuments({ postId: post._id });

        return {
          _id: post._id,
          tweets: post.tweets,
          createdAt: post.createdAt,
          user: post.author,
          likesCount: post.likes.length,
          bookmarksCount: post.bookmarks.length,
          commentsCount: commentCount,
          likes: post.likes,           // <-- Include full list of liked user IDs
          bookmarks: post.bookmarks,   // <-- Include full list of bookmarked user IDs
        };
      })
    );

    res.status(200).json({
      threads: simplifiedThreads,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching threads:", err);
    res.status(500).json({ message: "Failed to fetch threads" });
  }
};

exports.getMyThreads = async (req, res) => {
  const { authorId } = req.params;
  try {
    const { page = 1, limit = 10, userId } = req.query;

    // const query = userId ? { author: userId } : {};

    const threads = await Thread.find({author:authorId})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("author");

    const total = await Thread.countDocuments({author:authorId});

    const simplifiedThreads = await Promise.all(
      threads.map(async (post) => {
        const commentCount = await Comment.countDocuments({ postId: post._id });

        return {
          _id: post._id,
          tweets: post.tweets,
          createdAt: post.createdAt,
          user: post.author,
          likesCount: post.likes.length,
          bookmarksCount: post.bookmarks.length,
          commentsCount: commentCount,
          likes: post.likes,           // <-- Include full list of liked user IDs
          bookmarks: post.bookmarks,   // <-- Include full list of bookmarked user IDs
        };
      })
    );

    res.status(200).json({
      threads: simplifiedThreads,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching threads:", err);
    res.status(500).json({ message: "Failed to fetch threads" });
  }
};

exports.getThreadsById = async (req, res) => {
  const { PostId } = req.params;

  // console.log(PostId)
  try {
    // const { page = 1, limit = 10, userId } = req.query;

    // const query = userId ? { author: userId } : {};

    const threads = await Thread.find({_id:PostId})
      .sort({ createdAt: -1 })
      // .skip((page - 1) * limit)
      // .limit(parseInt(limit))
      .populate("author");

    const total = await Thread.countDocuments({_id:PostId});

    const simplifiedThreads = await Promise.all(
      threads.map(async (post) => {
        const commentCount = await Comment.countDocuments({ postId: post._id });

        return {
          _id: post._id,
          tweets: post.tweets,
          createdAt: post.createdAt,
          user: post.author,
          likesCount: post.likes.length,
          bookmarksCount: post.bookmarks.length,
          commentsCount: commentCount,
          likes: post.likes,           // <-- Include full list of liked user IDs
          bookmarks: post.bookmarks,   // <-- Include full list of bookmarked user IDs
        };
      })
    );

    res.status(200).json({
      threads: simplifiedThreads,
      total,
      // page: parseInt(page),
      // limit: parseInt(limit),
      // totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching threads:", err);
    res.status(500).json({ message: "Failed to fetch threads" });
  }
};


// exports.getBookmarkedThreads = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, userId, bookmarkedBy } = req.query;
    
//     let query = {};

//     // Ensure `bookmarkedBy` is a valid ObjectId
//     if (bookmarkedBy && !mongoose.Types.ObjectId.isValid(bookmarkedBy)) {
//       return res.status(400).json({ message: "Invalid bookmarkedBy ID" });
//     }

//     // Filter by author if userId is provided
//     if (userId) {
//       query.author = userId;
//     }

//     // Filter by bookmarkedBy (userId who bookmarked the thread)
//     if (bookmarkedBy) {
//       query.bookmarks = { $in: [new mongoose.Types.ObjectId(bookmarkedBy)] };
//     }

//     // Fetch threads with pagination
//     const threads = await Thread.find(query)
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .populate("author");

//     const total = await Thread.countDocuments(query);

//     // Use Promise.all for async mapping to get comment counts
//     const simplifiedThreads = await Promise.all(
//       threads.map(async (post) => {
//         const commentCount = await Comment.countDocuments({ threadId: post._id });
//         return {
//             _id: post._id,
//             tweets: post.tweets,
//             createdAt: post.createdAt,
//             user: post.author,
//             likesCount: post.likes.length,
//             bookmarksCount: post.bookmarks.length,
//             commentsCount: commentCount,
//             likes: post.likes,           // <-- Include full list of liked user IDs
//             bookmarks: post.bookmarks,   // <-- Include full list of bookmarked user IDs
//           };
//       })
//     );

//     // Return the response with paginated threads
//     res.status(200).json({
//       threads: simplifiedThreads,
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit),
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     console.error("Error fetching threads:", err);
//     res.status(500).json({ message: "Failed to fetch threads" });
//   }
// };

exports.getBookmarkedThreads = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, bookmarkedBy } = req.query;

    let query = {};

    // Validate bookmarkedBy ID
    if (bookmarkedBy && !mongoose.Types.ObjectId.isValid(bookmarkedBy)) {
      return res.status(400).json({ message: "Invalid bookmarkedBy ID" });
    }

    // Filter by author
    if (userId) {
      query.author = userId;
    }

    // Filter by bookmarks
    if (bookmarkedBy) {
      query.bookmarks = { $in: [new mongoose.Types.ObjectId(bookmarkedBy)] };
    }

    // Fetch matching threads
    const threads = await Thread.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("author");

    const total = await Thread.countDocuments(query);

    // Process each thread to include like status and comment count
    const simplifiedThreads = await Promise.all(
      threads.map(async (post) => {
        const commentCount = await Comment.countDocuments({
          threadId: post._id,
        });

        const isLiked = bookmarkedBy
          ? post.likes.some(
              (userId) => userId.toString() === bookmarkedBy.toString()
            )
          : false;

        return {
          _id: post._id,
          tweets: post.tweets,
          createdAt: post.createdAt,
          user: post.author,
          likesCount: post.likes.length,
          bookmarksCount: post.bookmarks.length,
          commentsCount: commentCount,
          isLiked, // ✅ frontend will now know if current user liked this
          likes: post.likes,
          bookmarks: post.bookmarks,
        };
      })
    );

    // Send back paginated results
    res.status(200).json({
      threads: simplifiedThreads,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching threads:", err);
    res.status(500).json({ message: "Failed to fetch threads" });
  }
};

exports.LikeThread = async (request, response) => {
  const { postId, author } = request.body;

  // console.log(postId, author)

  // const comment_id= request.params.commentId
  try {
    const newStory = await Thread.findByIdAndUpdate(
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

exports.unLikeThread = async (request, response) => {
  const { postId, author } = request.body;

  // console.log(postId, author)

  // const comment_id= request.params.commentId
  try {
    const newStory = await Thread.findByIdAndUpdate(
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

// Story bookmark
exports.BookmarkThread = async (request, response) => {
  const { postId, author } = request.body;

  try {
    const newStory = await Thread.findByIdAndUpdate(
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

exports.UnBookmarkThread = async (request, response) => {
  const { postId, author } = request.body;

  try {
    const newStory = await Thread.findByIdAndUpdate(
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
  
  