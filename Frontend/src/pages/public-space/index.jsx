import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Search,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image as ImageIcon,
  Video,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Bookmark,
  ChevronDown,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";


const API = "http://localhost:5001/api";

const PublicSpace = () => {
    const { t, i18n } = useTranslation();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [showFriends, setShowFriends] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);

  const [savedPostIds, setSavedPostIds] = useState([]);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [creatingPost, setCreatingPost] = useState(false);

  const [commentText, setCommentText] = useState({});
  const [openComments, setOpenComments] = useState({});

  const [editingPost, setEditingPost] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") ||
      localStorage.getItem("currentUser") ||
      localStorage.getItem("loggedInUser");

    if (!storedUser) return;

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("USER PARSE ERROR:", error);
    }
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    loadUser();
    loadPosts();
    loadFriendRequests();
  }, [user?.email]);

  const loadUser = async () => {
    try {
      const response = await axios.get(
        `${API}/friends/list/${encodeURIComponent(user.email)}`
      );

      console.log("FRIEND LIST RESPONSE:", response.data);

      if (!response.data?.success) return;

      const updatedUser = response.data.user || {};
      const friendList = response.data.friends || [];

      setFriends(friendList);

      setUser((prev) => ({
        ...prev,
        ...updatedUser,
        friends: friendList,
      }));

      const savedIds = (updatedUser.savedPosts || []).map((post) =>
        String(typeof post === "object" ? post._id : post)
      );

      setSavedPostIds(savedIds);
    } catch (error) {
      console.error(
        "LOAD USER ERROR:",
        error.response?.data || error.message
      );
    }
  };

  const loadPosts = async () => {
    try {
      const response = await axios.get(`${API}/post`);

      if (response.data?.success) {
        setPosts(response.data.posts || []);
      } else if (Array.isArray(response.data)) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error(
        "LOAD POSTS ERROR:",
        error.response?.data || error.message
      );
    }
  };

  const searchUsers = async (value) => {
    setFriendSearch(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    if (!user?.email) return;

    try {
      setSearchingUsers(true);

      const response = await axios.get(`${API}/friends/search`, {
        params: {
          query: value.trim(),
          email: user.email,
        },
      });

      console.log("SEARCH RESPONSE:", response.data);

      if (response.data?.success) {
        setSearchResults(response.data.users || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error(
        "SEARCH ERROR:",
        error.response?.data || error.message
      );
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const sendFriendRequest = async (receiverEmail) => {
    if (!user?.email) {
      alert(t("pleaseLoginFirst"));
      return;
    }

    try {
      const response = await axios.post(`${API}/friends/request`, {
        senderEmail: user.email,
        receiverEmail,
      });

      console.log("FRIEND REQUEST RESPONSE:", response.data);

      if (response.data?.success) {
        alert(t("friendRequestSent"));
        await searchUsers(friendSearch);
      } else {
        alert(response.data?.message || t("unableToSendFriendRequest"));
      }
    } catch (error) {
      console.error(
        "FRIEND REQUEST ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          t("unableToSendFriendRequest")
      );
    }
  };

  const acceptFriendRequest = async (senderEmail) => {
  if (!user?.email) return;

  try {
    const response = await axios.post(
      `${API}/friends/accept`,
      {
        senderEmail,
        receiverEmail: user.email,
      }
    );

    if (response.data?.success) {
      alert(t("friendRequestAccepted"));

      await loadFriendRequests();
      await loadUser();
    } else {
      alert(response.data?.message || t("unableToAcceptFriendRequest"));
    }
  } catch (error) {
    console.error(
      "ACCEPT REQUEST ERROR:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        t("unableToAcceptFriendRequest")
    );
  }
};

const rejectFriendRequest = async (senderEmail) => {
  if (!user?.email) return;

  try {
    const response = await axios.post(
      `${API}/friends/reject`,
      {
        senderEmail,
        receiverEmail: user.email,
      }
    );

    if (response.data?.success) {
      alert(t("friendRequestRejected"));

      await loadFriendRequests();
    } else {
      alert(response.data?.message || t("unableToRejectFriendRequest"));
    }
  } catch (error) {
    console.error(
      "REJECT REQUEST ERROR:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        t("unableToRejectFriendRequest")
    );
  }
};

  const friendCount = friends.length;

  const getPostLimit = () => {
    if (friendCount === 0) return 0;
    if (friendCount > 10) return Infinity;
    return friendCount;
  };

  const postLimit = getPostLimit();

  const postsToday = posts.filter((post) => {
    if (!post.createdAt) return false;

    const today = new Date();
    const postDate = new Date(post.createdAt);

    const postUserId =
      typeof post.user === "object" ? post.user?._id : post.user;

    return (
      today.getFullYear() === postDate.getFullYear() &&
      today.getMonth() === postDate.getMonth() &&
      today.getDate() === postDate.getDate() &&
      String(postUserId) === String(user?._id)
    );
  }).length;

  const postsLeft =
    postLimit === Infinity
      ? t("unlimited")
      : Math.max(postLimit - postsToday, 0);

  const canPost =
    friendCount > 0 &&
    (postLimit === Infinity || postsToday < postLimit);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(t("pleaseSelectImageOrVideo"));
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeSelectedFile = () => {
    if (preview) URL.revokeObjectURL(preview);

    setSelectedFile(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const createPost = async () => {
    if (!user?.email) {
      alert(t("pleaseLoginFirst"));
      return;
    }

    if (friendCount === 0) {
      alert("Add friends to start posting.");
      return;
    }

    if (!canPost) {
      alert(
        // `Daily post limit reached. You can post only ${postLimit} time(s) today.`
        t("dailyPostLimitReached")
      );
      return;
    }

    if (!caption.trim() && !selectedFile) {
      alert(t("pleaseWriteSomething"));
      return;
    }

    try {
      setCreatingPost(true);

      const formData = new FormData();
      formData.append("email", user.email);
      formData.append("caption", caption.trim());

      if (selectedFile) {
        formData.append("media", selectedFile);
      }

      const response = await axios.post(
        `${API}/post/create`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data?.success) {
        alert(t("postCreatedSuccessfully"));
        setCaption("");
        removeSelectedFile();
        await loadPosts();
      } else {
        alert(response.data?.message || t("unableToCreatePost"));
      }
    } catch (error) {
      console.error(
        "CREATE POST ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          t("unableToCreatePost")
      );
    } finally {
      setCreatingPost(false);
    }
  };

  const likePost = async (postId) => {
    if (!user?.email) {
      alert(t("pleaseLoginFirst"));
      return;
    }

    try {
      const response = await axios.post(`${API}/post/like`, {
        email: user.email,
        postId,
      });

      if (response.data?.success) {
        await loadPosts();
      } else {
        alert(response.data?.message || t("unableToLikePost"));
      }
    } catch (error) {
      console.error(
        "LIKE ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          t("unableToLikePost")
      );
    }
  };

  const addComment = async (postId) => {
    const text = commentText[postId]?.trim();

    if (!text) {
      alert(t("pleaseWriteComment"));
      return;
    }

    if (!user?.email) {
      alert(t("pleaseLoginFirst"));
      return;
    }

    try {
      const response = await axios.post(`${API}/post/comment`, {
        email: user.email,
        postId,
        text,
      });

      if (response.data?.success) {
        setCommentText((prev) => ({
          ...prev,
          [postId]: "",
        }));

        await loadPosts();
      } else {
        alert(response.data?.message || t("unableToAddComment"));
      }
    } catch (error) {
      console.error(
        "COMMENT ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          t("unableToAddComment")
      );
    }
  };

  const sharePost = async (postId) => {
    if (!user?.email) {
      alert(t("pleaseLoginFirst"));
      return;
    }

    try {
      const response = await axios.post(`${API}/post/share`, {
        email: user.email,
        postId,
      });

      if (response.data?.success) {
        await loadPosts();

        const shareUrl =
          `${window.location.origin}/public-space?post=${postId}`;

        try {
          await navigator.clipboard.writeText(shareUrl);
          alert(t("postSharedLinkCopied"));
        } catch {
          alert("Post shared successfully.");
        }
      } else {
        alert(response.data?.message || t("unableToSharePost"));
      }
    } catch (error) {
      console.error(
        "SHARE ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          t("unableToSharePost")
      );
    }
  };

  const savePost = async (postId) => {
    if (!user?.email) {
      alert(t("pleaseLoginFirst"));
      return;
    }

    const id = String(postId);

    try {
      const response = await axios.post(`${API}/post/save`, {
        email: user.email,
        postId: id,
      });

      console.log("SAVE RESPONSE:", response.data);

      if (!response.data?.success) {
        alert(response.data?.message || t("unableToSavePost"));
        return;
      }

      if (response.data.message === "Post saved successfully") {
        setSavedPostIds((prev) =>
          prev.includes(id) ? prev : [...prev, id]
        );
      } else if (
        response.data.message === "Post removed from saved posts"
      ) {
        setSavedPostIds((prev) =>
          prev.filter((savedId) => savedId !== id)
        );
      } else {
        await loadUser();
      }
    } catch (error) {
      console.error(
        "SAVE ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          t("unableToSavePost")
      );
    }
  };

  const loadFriendRequests = async () => {
  if (!user?.email) return;

  try {
    const response = await axios.get(
      `${API}/friends/requests/${encodeURIComponent(user.email)}`
    );

    if (response.data?.success) {
      setFriendRequests(response.data.requests || []);
    }
  } catch (error) {
    console.error(
      "LOAD FRIEND REQUESTS ERROR:",
      error.response?.data || error.message
    );
  }
};

  const deletePost = async (postId) => {
    if (!user?.email) return;

    const confirmed = window.confirm(
      t("confirmDeletePost")
    );

    if (!confirmed) return;

    try {
      const response = await axios.delete(
        `${API}/post/delete/${postId}`,
        {
          data: { email: user.email },
        }
      );

      if (response.data?.success) {
        setPosts((prev) =>
          prev.filter(
            (post) => String(post._id) !== String(postId)
          )
        );

        setSavedPostIds((prev) =>
          prev.filter((id) => id !== String(postId))
        );

        alert(t("postDeletedSuccessfully"));
      } else {
        alert(response.data?.message || t("unableToDeletePost"));
      }
    } catch (error) {
      console.error(
        "DELETE ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          t("unableToDeletePost")
      );
    }
  };

  const startEdit = (post) => {
    setEditingPost(post._id);
    setEditCaption(post.caption || "");
    setOpenMenu(null);
  };

  const updatePost = async (postId) => {
    if (!editCaption.trim()) {
      alert("Caption cannot be empty.");
      return;
    }

    try {
      const response = await axios.put(
        `${API}/post/edit/${postId}`,
        {
          email: user.email,
          caption: editCaption.trim(),
        }
      );

      if (response.data?.success) {
        setPosts((prev) =>
          prev.map((post) =>
            String(post._id) === String(postId)
              ? { ...post, ...response.data.post }
              : post
          )
        );

        setEditingPost(null);
        setEditCaption("");
        alert("Post updated successfully.");
      } else {
        alert(response.data?.message || "Unable to update post.");
      }
    } catch (error) {
      console.error(
        "EDIT ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Unable to update post."
      );
    }
  };

  const toggleComments = (postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const isOwnPost = (post) => {
    const postUserId =
      typeof post.user === "object" ? post.user?._id : post.user;

    return String(postUserId) === String(user?._id);
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPostUserName = (post) => {
    if (typeof post.user === "object") {
      return post.user?.name || "User";
    }

    if (isOwnPost(post)) {
      return user?.name || "User";
    }

    return "User";
  };

  const getPostUserPhoto = (post) => {
    if (typeof post.user === "object") {
      return post.user?.photo || "";
    }

    if (isOwnPost(post)) {
      return user?.photo || "";
    }

    return "";
  };

  const isPostSaved = (postId) =>
    savedPostIds.includes(String(postId));

  const isFriend = (personId) =>
    friends.some(
      (friend) => String(friend?._id) === String(personId)
    );

  const requestSent = (person) =>
    (person.friendRequests || []).some(
      (id) =>
        String(id?._id || id) === String(user?._id)
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-7">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("publicSpace")}
          </h1>
          <p className="text-gray-600 mt-2">
            {t("share")}, {t("connectAndEngage")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[370px_1fr] gap-7">
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 truncate">
                    {user?.name || t("user")}
                  </h2>
                  <p className="text-gray-500 truncate">
                    {user?.email || ""}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {friendCount}
                  </p>
                  <p className="text-blue-600 text-sm">{t("friends")}</p>
                </div>

                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {postsLeft}
                  </p>
                  <p className="text-green-600 text-sm">{t("postsLeft")}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Search size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  {t("findFriends")}
                </h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={friendSearch}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder={t("searchByNameOrEmail")}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  className="w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center"
                  onClick={() => searchUsers(friendSearch)}
                >
                  <Search size={21} />
                </button>
              </div>

              {friendSearch && (
                <div className="mt-3 border rounded-lg overflow-hidden">
                  {searchingUsers ? (
                    <p className="p-3 text-sm text-gray-500">
                      {t("searching")}
                    </p>
                  ) : searchResults.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500">
                      {t("noUserFound")}
                    </p>
                  ) : (
                    searchResults.map((person) => {
                      const alreadyFriend = isFriend(person._id);
                      const alreadyRequested = requestSent(person);

                      return (
                        <div
                          key={person._id}
                          className="p-3 flex items-center gap-3 border-b last:border-b-0"
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {person.photo ? (
                              <img
                                src={person.photo}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                                {person.name?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {person.name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {person.email}
                            </p>
                          </div>

                          {alreadyFriend ? (
                            <span className="text-sm text-green-600 font-semibold">
                              {t("friends")}
                            </span>
                          ) : alreadyRequested ? (
                            <span className="text-sm text-gray-500 font-semibold">
                              {t("requestSent")}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                sendFriendRequest(person.email)
                              }
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                            >
                              {t("addFriend")}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* FRIEND REQUESTS */}
<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

  <div className="p-5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Users size={20} className="text-blue-600" />

      <span className="font-bold text-gray-900">
        {t("friendRequests")}
      </span>
    </div>

    {friendRequests.length > 0 && (
      <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
        {friendRequests.length}
      </span>
    )}
  </div>

  <div className="border-t">

    {friendRequests.length === 0 ? (
      <p className="p-5 text-sm text-gray-500">
        {t("noFriendRequests")}
      </p>
    ) : (
      friendRequests.map((request) => (
        <div
          key={request._id}
          className="p-4 border-b last:border-b-0"
        >

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">

              {request.photo ? (
                <img
                  src={request.photo}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                  {request.name?.charAt(0) || "U"}
                </div>
              )}

            </div>

            <div className="min-w-0 flex-1">

              <p className="font-semibold text-gray-900 truncate">
                {request.name}
              </p>

              <p className="text-sm text-gray-500 truncate">
                {request.email}
              </p>

            </div>

          </div>

          <div className="flex gap-2 mt-3">

            <button
              type="button"
              onClick={() =>
                acceptFriendRequest(request.email)
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold"
            >
              {t("accept")}
            </button>

            <button
              type="button"
              onClick={() =>
                rejectFriendRequest(request.email)
              }
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-semibold"
            >
              {t("reject")}
            </button>

          </div>

        </div>
      ))
    )}

  </div>
</div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setShowFriends((prev) => !prev)}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-blue-600" />
                  <span className="font-bold text-gray-900">
                    {t("myFriends")} ({friendCount})
                  </span>
                </div>

                <ChevronDown
                  size={20}
                  className={`transition-transform ${
                    showFriends ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showFriends && (
                <div className="border-t">
                  {friends.length === 0 ? (
                    <p className="p-5 text-sm text-gray-500">
                      {t("noFriendsYet")}
                    </p>
                  ) : (
                    friends.map((friend) => (
                      <div
                        key={friend._id}
                        className="p-4 flex items-center gap-3 border-b last:border-b-0"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {friend.photo ? (
                            <img
                              src={friend.photo}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                              {friend.name?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {friend.name || "User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {friend.email || ""}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </aside>

          <main className="min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-7">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {user?.name || t("user")}
                  </h3>

                  {friendCount === 0 && (
                    <p className="text-red-500 text-sm mt-1">
                      {t("addFriendsToStartPostingMessage")}
                    </p>
                  )}
                </div>
              </div>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={!canPost}
                placeholder={
                  friendCount === 0
                    ? t("addFriendsToStartPosting")
                    : t("whatsOnYourMind")
                }
                className="w-full mt-5 min-h-[130px] border border-gray-200 bg-gray-50 rounded-xl px-4 py-4 resize-none outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:text-gray-400"
              />

              {preview && (
                <div className="relative mt-4 rounded-xl overflow-hidden border">
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="absolute top-3 right-3 z-10 bg-black/70 text-white rounded-full p-2 hover:bg-black"
                  >
                    <X size={18} />
                  </button>

                  {selectedFile?.type.startsWith("video") ? (
                    <video
                      src={preview}
                      controls
                      className="w-full max-h-[450px] object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-[450px] object-contain"
                    />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 mt-5 pt-4">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    disabled={!canPost}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-green-500 hover:text-green-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    <ImageIcon size={21} />
                    <span>{t("photo")}</span>
                  </button>

                  <button
                    type="button"
                    disabled={!canPost}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    <Video size={21} />
                    <span>{t("video")}</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={createPost}
                  disabled={!canPost || creatingPost}
                  className={`px-7 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
                    canPost
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-300 text-white cursor-not-allowed"
                  }`}
                >
                  {!canPost && <Lock size={18} />}
                  {creatingPost
                    ? t("posting")
                    : !canPost
                    ? t("locked")
                    : t("createPost")}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
                 {t("noPostsYet")}
                </div>
              ) : (
                posts.map((post) => {
                  const liked = (post.likes || []).some((like) => {
                    const likeId =
                      typeof like === "object" ? like._id : like;

                    return String(likeId) === String(user?._id);
                  });

                  const saved = isPostSaved(post._id);

                  return (
                    <article
                      key={post._id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {getPostUserPhoto(post) ? (
                              <img
                                src={getPostUserPhoto(post)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                                {getPostUserName(post).charAt(0)}
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {getPostUserName(post)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(post.createdAt)}
                            </p>
                          </div>
                        </div>

                        {isOwnPost(post) && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === post._id
                                    ? null
                                    : post._id
                                )
                              }
                              className="p-2 hover:bg-gray-100 rounded-full"
                            >
                              <MoreHorizontal size={22} />
                            </button>

                            {openMenu === post._id && (
                              <div className="absolute right-0 top-10 w-36 bg-white border rounded-xl shadow-lg z-20 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => startEdit(post)}
                                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 text-left"
                                >
                                  <Pencil size={16} />
                                  {t("edit")}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenu(null);
                                    deletePost(post._id);
                                  }}
                                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-red-50 text-red-600 text-left"
                                >
                                  <Trash2 size={16} />
                                  {t("delete")}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="px-5 pb-5">
                        {editingPost === post._id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editCaption}
                              onChange={(e) =>
                                setEditCaption(e.target.value)
                              }
                              className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <button
                              type="button"
                              onClick={() => updatePost(post._id)}
                              className="bg-black text-white px-4 rounded-lg"
                            >
                              {t("save")}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingPost(null);
                                setEditCaption("");
                              }}
                              className="border px-4 rounded-lg"
                            >
                              {t("cancel")}
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-800 whitespace-pre-wrap">
                            {post.caption}
                          </p>
                        )}
                      </div>

                      {post.media && (
                        <div className="bg-black">
                          {post.mediaType === "video" ? (
                            <video
                              src={post.media}
                              controls
                              className="w-full max-h-[650px] object-contain"
                            />
                          ) : (
                            <img
                              src={post.media}
                              alt="Post"
                              className="w-full max-h-[650px] object-contain"
                            />
                          )}
                        </div>
                      )}

                      <div className="px-5 py-3 flex justify-between text-sm text-gray-500 border-b">
                        <span>
                          {post.likes?.length || 0}{" "}
                          {post.likes?.length === 1 ? t("like") : t("likes")}
                        </span>

                        <div className="flex gap-5">
                          <span>
                            {post.comments?.length || 0} {t("comment")}
                          </span>
                          <span>{post.shares || 0} {t("shares")}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 border-b">
                        <button
                          type="button"
                          onClick={() => likePost(post._id)}
                          className={`py-4 flex items-center justify-center gap-2 hover:bg-gray-50 ${
                            liked ? "text-red-500" : "text-gray-600"
                          }`}
                        >
                          <Heart
                            size={21}
                            fill={liked ? "currentColor" : "none"}
                          />
                          <span>{t("like")}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleComments(post._id)}
                          className="py-4 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50"
                        >
                          <MessageCircle size={21} />
                          <span>{t("comment")}</span>
                          <ChevronDown
                            size={16}
                            className={
                              openComments[post._id]
                                ? "rotate-180"
                                : ""
                            }
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => sharePost(post._id)}
                          className="py-4 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50"
                        >
                          <Share2 size={21} />
                          <span>{t("share")}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => savePost(post._id)}
                          className={`py-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition ${
                            saved ? "text-black" : "text-gray-600"
                          }`}
                        >
                          <Bookmark
                            size={21}
                            fill={saved ? "currentColor" : "none"}
                          />
                          <span>{saved ? t("saved") : t("save")}</span>
                        </button>
                      </div>

                      {openComments[post._id] && (
                        <div className="p-5">
                          <div className="space-y-4">
                            {post.comments?.length === 0 ? (
                              <p className="text-sm text-gray-500">
                               {t("noCommentsYet")}
                              </p>
                            ) : (
                              post.comments?.map((comment, index) => {
                                const commentUser =
                                  typeof comment.user === "object"
                                    ? comment.user
                                    : null;

                                const commentName =
                                  commentUser?.name ||
                                  (String(comment.user) ===
                                  String(user?._id)
                                    ? user?.name
                                    : "User");

                                const commentPhoto =
                                  commentUser?.photo ||
                                  (String(comment.user) ===
                                  String(user?._id)
                                    ? user?.photo
                                    : "");

                                return (
                                  <div
                                    key={
                                      comment._id || `${post._id}-${index}`
                                    }
                                    className="flex gap-3"
                                  >
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                      {commentPhoto ? (
                                        <img
                                          src={commentPhoto}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                                          {commentName?.charAt(0) || "U"}
                                        </div>
                                      )}
                                    </div>

                                    <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1">
                                      <p className="font-semibold text-sm">
                                        {commentName}
                                      </p>

                                      <p className="text-gray-700 mt-1">
                                        {comment.text}
                                      </p>

                                      <p className="text-xs text-gray-400 mt-1">
                                        {formatDate(comment.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-5">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {user?.photo ? (
                                <img
                                  src={user.photo}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold">
                                  {user?.name?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={commentText[post._id] || ""}
                                onChange={(e) =>
                                  setCommentText((prev) => ({
                                    ...prev,
                                    [post._id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    addComment(post._id);
                                  }
                                }}
                                placeholder={t("writeAComment")}
                                className="w-full border border-gray-200 rounded-full px-5 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                              />

                              <button
                                type="button"
                                onClick={() => addComment(post._id)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
                              >
                                <Send size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PublicSpace;
