import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaHeart,
  FaRegCommentDots,
  FaShare,
} from "react-icons/fa";

export default function PublicSpace() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/post");
      setPosts(res.data.posts);
    } catch (error) {
      console.error(error);
    }
  };

const handleLike = async (postId) => {
  if (!user) {
    alert("Please login first");
    return;
  }

  try {
    await axios.post("http://localhost:5001/api/post/like", {
      email: user.email,
      postId,
    });

    fetchPosts();
  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          {t("publicSpace")}
        </h1>

        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={post.user.photo}
                alt={post.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <h2 className="font-semibold text-lg">
                  {post.user.name}
                  <p className="text-xs text-gray-400">
  {new Date(post.createdAt).toLocaleString()}
</p>
                </h2>
                <p className="text-sm text-gray-500">
                  {post.user.email}
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">
              {post.caption}
            </p>

            {post.media && (
              <img
                src={post.media}
                alt="Post"
                className="rounded-lg w-full mb-4"
              />
            )}

           <div className="border-t mt-4 pt-3 flex justify-around">
<button
  onClick={() => handleLike(post._id)}
  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition"
>
  <FaHeart />
  <span>{post.likes.length}</span>
</button>

  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
    <FaRegCommentDots />
    <span>{post.comments.length}</span>
  </button>

  <button className="flex items-center gap-2 text-gray-600 hover:text-green-500 transition">
    <FaShare />
    <span>{post.shares}</span>
  </button>

</div>
          </div>
        ))}
      </div>
    </div>
  );
}