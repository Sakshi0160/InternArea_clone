const express = require("express");
const router = express.Router();
const User = require("../Model/User");

// =====================================================
// SEND FRIEND REQUEST
// =====================================================
router.post("/request", async (req, res) => {
  try {
    const {
      senderEmail,
      receiverEmail,
    } = req.body;

    if (!senderEmail || !receiverEmail) {
      return res.status(400).json({
        success: false,
        message: "Sender and receiver email are required",
      });
    }

    if (senderEmail === receiverEmail) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a friend request to yourself",
      });
    }

    const sender = await User.findOne({
      email: senderEmail,
    });

    const receiver = await User.findOne({
      email: receiverEmail,
    });

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Already friends?
    const alreadyFriend = receiver.friends.some(
      (id) =>
        id.toString() === sender._id.toString()
    );

    if (alreadyFriend) {
      return res.status(400).json({
        success: false,
        message: "Already friends",
      });
    }

    // Request already sent?
    const alreadyRequested =
      receiver.friendRequests.some(
        (id) =>
          id.toString() === sender._id.toString()
      );

    if (alreadyRequested) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent",
      });
    }

    // Add sender to receiver's requests
    receiver.friendRequests.push(sender._id);

    await receiver.save();

    res.status(200).json({
      success: true,
      message: "Friend request sent successfully",
    });

  } catch (error) {
    console.error("SEND FRIEND REQUEST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


// =====================================================
// GET FRIEND REQUESTS
// =====================================================
router.get("/requests/:email", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.params.email,
    }).populate(
      "friendRequests",
      "name email photo"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      requests: user.friendRequests || [],
    });

  } catch (error) {
    console.error("GET REQUESTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


// =====================================================
// ACCEPT FRIEND REQUEST
// =====================================================
router.post("/accept", async (req, res) => {
  try {
    const {
      senderEmail,
      receiverEmail,
    } = req.body;

    const sender = await User.findOne({
      email: senderEmail,
    });

    const receiver = await User.findOne({
      email: receiverEmail,
    });

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check pending request
    const hasRequest =
      receiver.friendRequests.some(
        (id) =>
          id.toString() === sender._id.toString()
      );

    if (!hasRequest) {
      return res.status(400).json({
        success: false,
        message: "No pending friend request",
      });
    }

    // Add each other as friends
    if (
      !sender.friends.some(
        (id) =>
          id.toString() === receiver._id.toString()
      )
    ) {
      sender.friends.push(receiver._id);
    }

    if (
      !receiver.friends.some(
        (id) =>
          id.toString() === sender._id.toString()
      )
    ) {
      receiver.friends.push(sender._id);
    }

    // Remove request
    receiver.friendRequests =
      receiver.friendRequests.filter(
        (id) =>
          id.toString() !== sender._id.toString()
      );

    await sender.save();
    await receiver.save();

    res.status(200).json({
      success: true,
      message: "Friend request accepted",
    });

  } catch (error) {
    console.error("ACCEPT REQUEST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


// =====================================================
// REJECT FRIEND REQUEST
// =====================================================
router.post("/reject", async (req, res) => {
  try {
    const {
      senderEmail,
      receiverEmail,
    } = req.body;

    const sender = await User.findOne({
      email: senderEmail,
    });

    const receiver = await User.findOne({
      email: receiverEmail,
    });

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    receiver.friendRequests =
      receiver.friendRequests.filter(
        (id) =>
          id.toString() !== sender._id.toString()
      );

    await receiver.save();

    res.status(200).json({
      success: true,
      message: "Friend request rejected",
    });

  } catch (error) {
    console.error("REJECT REQUEST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


// =====================================================
// GET FRIEND LIST
// =====================================================
router.get("/list/:email", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.params.email,
    })
      .populate(
        "friends",
        "name email photo"
      )
      .populate(
        "friendRequests",
        "name email photo"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
      friends: user.friends || [],
      requests: user.friendRequests || [],
    });

  } catch (error) {
    console.error("GET FRIEND LIST ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


// =====================================================
// REMOVE FRIEND
// =====================================================
router.delete("/remove", async (req, res) => {
  try {
    const {
      userEmail,
      friendEmail,
    } = req.body;

    const user = await User.findOne({
      email: userEmail,
    });

    const friend = await User.findOne({
      email: friendEmail,
    });

    if (!user || !friend) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.friends = user.friends.filter(
      (id) =>
        id.toString() !==
        friend._id.toString()
    );

    friend.friends = friend.friends.filter(
      (id) =>
        id.toString() !==
        user._id.toString()
    );

    await user.save();
    await friend.save();

    res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });

  } catch (error) {
    console.error("REMOVE FRIEND ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// ==========================
// Search Users
// ==========================
router.get("/search", async (req, res) => {
  try {
    const { query, email } = req.query;

    if (!query || !query.trim()) {
      return res.json({
        success: true,
        users: [],
      });
    }

    const users = await User.find({
      email: { $ne: email },
      $or: [
        { name: { $regex: query.trim(), $options: "i" } },
        { email: { $regex: query.trim(), $options: "i" } },
      ],
    }).select("name email photo friends friendRequests");

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("SEARCH USERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to search users",
    });
  }
});

// ==========================
// Get Friend Requests
// ==========================
router.get("/requests/:email", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.params.email,
    }).populate("friendRequests", "name email photo");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      requests: user.friendRequests,
    });
  } catch (error) {
    console.error("GET FRIEND REQUESTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;