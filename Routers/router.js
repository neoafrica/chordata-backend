// const router= require('express').Router()
const express = require("express");

const router = express.Router();
// const multer  = require('multer')

// const storage= multer.memoryStorage()
// const upload = multer({ storage: storage });

const {
  createPost,
  createUser,
  clinicalCase,
  clinicalPic,
  frontImage,
  getFrontImage,
  deleteFrontImage,
  StoryBillboard,
  getBillBoardImage,
  deleteStoryBillBoardImage,
  CreateCases,
  Notifications,
  PushNotifications,
} = require("../Controllers/createPost");
const {
  deletePost,
  updatePost,
  getPost,
  deleteUser,
  getUser,
  getLatestPost,
  searchPost,
  relatedPost,
  getClinicalPosts,
  login,
  getUserData,
  updateUserProfile,
  createStory,
  getStory,
  questions,
  getQuestions,
  AddComment,
  getComments,
  AddReply,
  deleteComment,
  recentQA,
  MyQA,
  Cases,
  getCase,
  RecentCase,
  recentCaseCategory,
  MyCase,
  RelatedCases,
  Like,
  unLike,
  myStory,
  Bookmark,
  unBookmark,
  BookmarkStory,
  UnBookmarkStory,
  Search,
  deleteQuestion,
  SearchAll,
  TotalUsers,
  DeleteUser,
  getCaseById,
  getAllComments,
  getStoryById,
  deleteCase,
  likeComment,
  unLikeComments,
  Otp,
  ResetPassword,
  getQuestionById,
  getAllCase,
  getStoryData,
  deleteThread,
  getQuestionsForAdmin,
  chartRoomUsers,
  Messages,
  ChatHeader,
  getConvo,
  InBox,
  markMessagesAsRead,
  DeleteMessage,
} = require("../Controllers/Posts");
const multer = require("../Middleware/multer");

// router.post('/clinical',upload.array('caseImage',2),clinicalCase )

// router.post('/clinical',multer.single('caseImage'),clinicalCase )

// router.post('/clinical',multer.single('caseImage'),clinicalPic )

// router.delete('/:PostId', deleteUser)

// router.delete('/mypost/:PostId', deletePost)

// router.put("/:PostId",multer.single('profileImage'), updatePost)

// router.get('/retriev/:PostId', getUser )

// router.get('/retriev-post', getPost)

// router.get('/latest-post', getLatestPost)

// router.get('/search', searchPost)

// router.get('/related-post/:PostId', relatedPost)

const Multer = require("multer");

const { storage } = require("../cloudinary/index");
const {
  createThread,
  getThreads,
  LikeThread,
  unLikeThread,
  BookmarkThread,
  UnBookmarkThread,
  getBookmarkedThreads,
  getMyThreads,
  getThreadsById,
} = require("../Thread/Thread");

const upload = Multer({ storage });

// Thread

// router.post("/threads", upload.array('images'), createThread)

router.post(
  "/threads",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "tweets", maxCount: 1 },
  ]),
  createThread
);

router.get("/get-threads", getThreads);

// Get my threads

router.get("/get-my-threads/:authorId", getMyThreads);

// Delete thread

router.delete("/delete-thread/:threadId", deleteThread);

// Bookmarked thread

router.get("/get-threads-bookmark", getBookmarkedThreads);

// like a story

router.put("/like-thread", LikeThread);

// unlike a story

router.put("/unlike-thread", unLikeThread);

// story bookmark

router.put("/bookmark-thread", BookmarkThread);

// Remove story bookmark

router.put("/unbookmark-thread", UnBookmarkThread);

// *************************************************************
//clinical
router.get("/clinical-post", getClinicalPosts);

//sign up
router.post("/signUp", multer.single("profileImage"), createUser);

//login

// router.post('/login', login)
router.post("/login", login);

// user data from login

router.post("/user-data", getUserData);

// update user details
router.post("/update-user", updateUserProfile);

// create story

router.post("/write-story", createStory);

// My story

router.get("/mystory/:authorId", myStory);

// get stories for admin panel

router.get("/stories", getStory);

// Get story for user with pagination

router.get("/stories-users", getStoryData);

// post questions

// router.post('/questions', questions)

// Post questions with formData

router.post("/questions", upload.array("qnImage"), questions);

// get questions

router.get("/get-questions", getQuestions);

// GEt Question for Admin

router.get("/get-admin-questions", getQuestionsForAdmin);

// Add comment

router.post("/addComment", AddComment);

// get comments

router.get("/get-comments/:PostId", getComments);

// Get all comments for the admin panel

router.get("/get-comments", getAllComments);

// add reply

router.put("/reply", AddReply);

// delete comments

router.delete("/delete-comment/:commentId", deleteComment);

//  delete question

router.delete("/delete-question/:questionId", deleteQuestion);

// Delete case

router.delete("/delete-case/:caseId", deleteCase);

// Recent Q & A

router.get("/recentQA", recentQA);

// my Q & A

router.get("/myQA/:authorId", MyQA);

// create cases
router.post("/case", multer.array("images"), Cases);

// create cases from formData

router.post("/create-case", upload.array("caseImage"), CreateCases);

// get case

router.get("/get-case/:category/:animal", getCase);

router.get("/get-case", getCase);

// get recent cases

router.get("/recentCases", RecentCase);

// get recents cases by animal category

router.get("/recentCaseCategory", recentCaseCategory);

// My cases

router.get("/myCases/:authorId", MyCase);

// Related cases

router.get("/related-cases", RelatedCases);

// like a story

router.put("/like", Like);

// unlike a story

router.put("/unlike", unLike);

// Like a comment

router.put("/like-comment", likeComment);

//  unlike a comment

router.put("/unlike-comment", unLikeComments);

// Add bookmark

router.put("/bookmark-add", Bookmark);

// Remove bookmark

router.put("/bookmark-remove", unBookmark);

// story bookmark

router.put("/bookmark-story", BookmarkStory);

// Remove story bookmark

router.put("/unbookmark-story", UnBookmarkStory);

// Search case

router.get("/search-case", Search);

// Search All cases

router.get("/search-All", SearchAll);

// front Image

router.post("/frontImage", multer.single("image"), frontImage);

// get front Images

router.get("/getImage", getFrontImage);

// Delete frontImages

router.delete("/delete-frontImage/:postId", deleteFrontImage);

// Story bill board Image

router.post("/StoryImage", multer.single("image"), StoryBillboard);

// Get Story Billboard Image

router.get("/getStoryImage", getBillBoardImage);

// Delete story Billboard image

router.delete("/delete-StoryImage/:postId", deleteStoryBillBoardImage);

// Total users with their stats

router.get("/Total-users-data", TotalUsers);

// Delete user and all his data

router.delete("/delete-user/:userId", DeleteUser);

// Get case by Id fromt the admin panel

router.get("/post-details/:postId", getCaseById);

// Get story by Id from the admin panel

router.get("/story-details/:storyId", getStoryById);

// Get question by Id from the admin panel

router.get("/question-details/:postId", getQuestionById);

// Get thread by Id

router.get("/thread-details/:PostId", getThreadsById);

// Otp

router.post("/send-otp", Otp);

// Reset passwords

router.post("/reset-password", ResetPassword);

// Get all cases

router.get("/All-case", getAllCase);

// Chart room users

router.get("/chart-users/:userId", chartRoomUsers);

// Message sent btn users

// router.post("/message", upload.any(), Messages);

router.post("/message", upload.single("imageFile"), Messages);

router.post("/message", Messages);

// Get user data for chat header

router.get("/get-users/:userId", ChatHeader);

// get Users convo

router.get("/users/:senderId/:recepientId", getConvo);

// get the inbox

router.get("/get-inbox/:userId", InBox);

router.post("/messages/mark-read", markMessagesAsRead);

// Delete messages

router.post("/delete-message", DeleteMessage)

module.exports = router;
