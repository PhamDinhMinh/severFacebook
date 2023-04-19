const jwt = require("jsonwebtoken");
const UserModel = require("../models/Users");
const PostModel = require("../models/Posts");
const FriendModel = require("../models/Friends");
var url = require("url");
const httpStatus = require("../utils/httpStatus");

const path = require("path");
const postsController = {};
postsController.create = async (req, res, next) => {
  let userId = req.userId;
  try {
    const { described, images, videos } = req.body;

    const post = new PostModel({
      author: userId,
      described: described,
      images: images,
      videos: videos,
      countComments: 0,
    });
    let postSaved = await post.save();

    return res.status(httpStatus.OK).json({
      data: postSaved,
    });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: e.message,
    });
  }
};
postsController.edit = async (req, res, next) => {
  try {
    let userId = req.userId;
    let postId = req.params.id;
    let postFind = await PostModel.findById(postId);
    if (postFind == null) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Can not find post" });
    }
    if (postFind.author.toString() !== userId) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: "Can not edit this post" });
    }

    const { described } = req.body;

    let postSaved = await PostModel.findByIdAndUpdate(postId, {
      described: described,
    });

    postSaved = await PostModel.findById(postSaved._id);

    return res.status(httpStatus.OK).json({
      data: postSaved,
    });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: e.message,
    });
  }
};
postsController.show = async (req, res, next) => {
  try {
    let post = await PostModel.findById(req.params.id)
      .populate({
        path: "author",
        select: "_id username phonenumber avatar",
        model: "Users",
        populate: {
          path: "avatar",
          select: "_id fileName",
          model: "Documents",
        },
      });
    if (post == null) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Can not find post" });
    }
    post.isLike = post.like.includes(req.userId);
    return res.status(httpStatus.OK).json({
      data: post,
    });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

postsController.delete = async (req, res, next) => {
  try {
    let post = await PostModel.findByIdAndDelete(req.params.id);
    if (post == null) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Can not find post" });
    }
    return res.status(httpStatus.OK).json({
      message: "Delete post done",
    });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

postsController.list = async (req, res, next) => {
  try {
    let posts = [];
    let userId = req.userId;
    if (req.query.userId) {
      // get Post of one user
      posts = await PostModel.find({
        author: req.query.userId,
      })
        // .populate("images", ["fileName"])
        // .populate("videos", ["fileName"])
        .populate({
          path: "author",
          // select: "_id username phonenumber avatar",
          model: "Users",
          // populate: {
          //   path: "avatar",
          //   select: "_id fileName",
          //   model: "Documents",
          // },
        });
    } else {
      const user = await UserModel.findById(userId);
      const blockedDiaryList = user.blocked_diary ? user.blocked_diary : [];
      // console.log(blockedDiaryList)
      // get list friend of 1 user
      let friends = await FriendModel.find({
        status: "1",
      }).or([
        {
          sender: userId,
        },
        {
          receiver: userId,
        },
      ]);
      let listIdFriends = [];
      // console.log(friends)
      for (let i = 0; i < friends.length; i++) {
        if (friends[i].sender.toString() === userId.toString()) {
          if (!blockedDiaryList.includes(friends[i].receiver))
            listIdFriends.push(friends[i].receiver);
        } else {
          if (!blockedDiaryList.includes(friends[i].sender))
            listIdFriends.push(friends[i].sender);
        }
      }
      listIdFriends.push(userId);
      // console.log(listIdFriends);
      // get post of friends of 1 user
      posts = await PostModel.find({
        author: listIdFriends,
      })
      // .populate("images", ["fileName"])
      // .populate("videos", ["fileName"])
      .populate({
        path: "author",
        // select: "_id username phonenumber avatar",
        model: "Users",
      //   populate: {
      //     path: "avatar",
      //     select: "_id fileName",
      //     model: "Documents",
      //   },
      });
    }
    let postWithIsLike = [];
    for (let i = 0; i < posts.length; i++) {
      let postItem = posts[i];
      postItem.isLike = postItem.like.includes(req.userId);
      postWithIsLike.push(postItem);
    }
    return res.status(httpStatus.OK).json({
      data: postWithIsLike,
    });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

module.exports = postsController;
