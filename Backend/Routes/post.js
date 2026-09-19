const express = require("express");
const router = express.Router();
const Post = require("../Model/Post");
const User = require("../Model/User");
const upload = require("../Uploads/postUpload");

// ==============================
// Create Post
// ==============================
router.post("/create", upload.single("media"), async (req, res) => {
      try {
    console.log("Request Body:", req.body);
    const { email, caption } = req.body;
    console.log("Body:", req.body);
console.log("File:", req.file);

let media = "";
let mediaType = "image";

if (req.file) {
  media = req.file.path;

  if (req.file.mimetype.startsWith("video")) {
    mediaType = "video";
  }
}
    console.log("Email:", email);
    // Find user
    const user = await User.findOne({ email });
    console.log("User:", user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Friend Count
    const friendCount = user.friends.length;

    // No friends
    if (friendCount === 0) {
      return res.status(400).json({
        success: false,
        message: "You need at least one friend to create a post.",
      });
    }

    // Today's posts
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayPosts = await Post.countDocuments({
      user: user._id,
      createdAt: { $gte: startOfDay },
    });

    // Unlimited for more than 10 friends
    if (friendCount <= 10 && todayPosts >= friendCount) {
      return res.status(400).json({
        success: false,
        message: `Daily post limit reached. You can post only ${friendCount} time(s) today.`,
      });
    }

    // Create post
    const post = await Post.create({
      user: user._id,
      caption,
      media,
      mediaType,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ==============================
// Get All Posts
// ==============================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email photo")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ==============================
// Like / Unlike Post
// ==============================
router.post("/like", async (req, res) => {
  try {
    const { email, postId } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === user._id.toString()
    );

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (id) => id.toString() !== user._id.toString()
      );

      await post.save();

      return res.json({
        success: true,
        message: "Post unliked",
        likes: post.likes.length,
      });
    }

    // Like
    post.likes.push(user._id);

    await post.save();

    res.json({
      success: true,
      message: "Post liked",
      likes: post.likes.length,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ==============================
// Comment on Post
// ==============================
// ==============================
// Comment on Post
// ==============================
router.post("/comment", async (req, res) => {
  try {
    console.log("========== COMMENT POST ==========");
    console.log("Request Body:", req.body);

    const { email, postId, text } = req.body;

    if (!email || !postId || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email, postId and comment are required",
      });
    }

    // Find logged-in user
    const user = await User.findOne({ email });

    console.log("Comment User:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find post
    const post = await Post.findById(postId);

    console.log("Comment Post:", post);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Add comment
    post.comments.push({
      user: user._id,
      text: text.trim(),
    });

    await post.save();

    // IMPORTANT:
    // Populate the comment user's name, email and photo
    await post.populate({
      path: "comments.user",
      select: "name email photo",
    });

    console.log("Comments after populate:", post.comments);

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comments: post.comments,
    });

  } catch (error) {
    console.error("COMMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// ==============================
// Share Post
// ==============================
router.post("/share", async (req, res) => {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.shares += 1;

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post shared successfully",
      shares: post.shares,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.delete("/delete/:postId", async (req, res) => {
  try {
    console.log("========== DELETE POST ==========");
    console.log("Request Params:", req.params);
    console.log("Request Body:", req.body);

    const { email } = req.body;
    const { postId } = req.params;

    console.log("Email:", email);
    console.log("Post ID:", postId);

    // Check collection name
    console.log("Collection Name:", Post.collection.name);

    // Check database name
    console.log("Database Name:", Post.db.name);

    // Find user
    const user = await User.findOne({ email });
    console.log("User:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Show all posts
    const allPosts = await Post.find();
    console.log("All Posts:", allPosts);

    // Find post
    const post = await Post.findById(postId);
    console.log("Post Found:", post);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    console.log("Post User:", post.user.toString());
    console.log("Logged User:", user._id.toString());

    if (post.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own post.",
      });
    }

    const deletedPost = await Post.findByIdAndDelete(postId);
    console.log("Deleted Post:", deletedPost);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });

  } catch (error) {
    console.error("========== DELETE ERROR ==========");
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// ==============================
// Edit Post
// ==============================
router.put("/edit/:postId", async (req, res) => {
  try {
    console.log("========== EDIT POST ==========");
    console.log("Request Params:", req.params);
    console.log("Request Body:", req.body);

    const { postId } = req.params;
    const { email, caption } = req.body;

    console.log("Post ID:", postId);
    console.log("Email:", email);

    console.log("Collection:", Post.collection.name);
    console.log("Database:", Post.db.name);

    const user = await User.findOne({ email });
    console.log("User:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const allPosts = await Post.find();
    console.log("All Posts:", allPosts);

    const post = await Post.findById(postId);
    console.log("Post:", post);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own post.",
      });
    }

    post.caption = caption;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("EDIT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ==============================
// Save / Unsave Post
// ==============================
router.post("/save", async (req, res) => {
  try {
    console.log("========== SAVE POST ==========");
    console.log("Request Body:", req.body);

    const { email, postId } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const alreadySaved = user.savedPosts.some(
      (id) => id.toString() === postId
    );

    if (alreadySaved) {
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== postId
      );

      await user.save();

      return res.json({
        success: true,
        message: "Post removed from saved posts",
      });
    }

    user.savedPosts.push(post._id);

    await user.save();

    res.json({
      success: true,
      message: "Post saved successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ==============================
// Get Saved Posts
// ==============================
router.get("/saved/:email", async (req, res) => {
  try {
    console.log("========== GET SAVED POSTS ==========");
    console.log("Email:", req.params.email);

    const { email } = req.params;

    const user = await User.findOne({ email }).populate({
      path: "savedPosts",
      populate: {
        path: "user",
        select: "name email photo",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      savedPosts: user.savedPosts,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});



module.exports = router;