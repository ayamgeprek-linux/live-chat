import React, { useEffect, useState, useRef } from "react";
import { onValue, ref, push, serverTimestamp } from "firebase/database";
import { auth, db, storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const usersRef = ref(db, "users/");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data)
          .map((uid) => ({
            uid,
            email: data[uid].email,
          }))
          .filter((user) => user.email !== currentUser?.email);
        setUsers(userList);
      }
    });
  }, [currentUser]);

  const generateChatId = (email1, email2) => {
    return [email1, email2].sort().join("_").replace(/\./g, "_");
  };

  useEffect(() => {
    if (!selectedUser || !currentUser) return;
    const chatId = generateChatId(currentUser.email, selectedUser.email);
    const chatRef = ref(db, "chats/" + chatId);

    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const chatMessages = Object.values(data);
        setMessages(chatMessages);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [selectedUser, currentUser]);

  const handleSend = async () => {
    if (!messageInput.trim() || !currentUser || !selectedUser) return;
    const chatId = generateChatId(currentUser.email, selectedUser.email);
    const chatRef = ref(db, "chats/" + chatId);

    await push(chatRef, {
      from: currentUser.email,
      to: selectedUser.email,
      message: messageInput,
      timestamp: serverTimestamp(),
    });

    setMessageInput("");
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser || !selectedUser) return;

    const chatId = generateChatId(currentUser.email, selectedUser.email);
    const imageRef = storageRef(storage, `chatImages/${Date.now()}_${file.name}`);

    await uploadBytes(imageRef, file);
    const imageUrl = await getDownloadURL(imageRef);

    const chatRef = ref(db, "chats/" + chatId);
    await push(chatRef, {
      from: currentUser.email,
      to: selectedUser.email,
      imageUrl,
      timestamp: serverTimestamp(),
    });

    fileInputRef.current.value = ""; // reset input setelah kirim
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Kontak</h2>
        {users.map((user) => (
          <div
            key={user.uid}
            className={`p-2 rounded cursor-pointer hover:bg-gray-300 ${
              selectedUser?.uid === user.uid ? "bg-blue-300" : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            {user.email}
          </div>
        ))}
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => {
            auth.signOut();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>

      {/* Chat Area */}
      <div className="w-3/4 p-4 flex flex-col bg-white">
        {selectedUser ? (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Chat dengan: {selectedUser.email}
            </h2>

            <div className="flex-1 overflow-y-auto border p-2 mb-4 rounded">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    msg.from === currentUser.email
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  <div className="inline-block bg-gray-100 p-2 rounded">
                    {msg.message && <p>{msg.message}</p>}
                    {msg.imageUrl && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">📷 Foto</p>
                        <img
                          src={msg.imageUrl}
                          alt="Gambar"
                          className="max-w-xs rounded mb-1"
                        />
                        <a
                          href={msg.imageUrl}
                          download
                          className="text-blue-500 text-sm underline"
                        >
                          ⬇️ Download
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border p-2 rounded"
                placeholder="Ketik pesan..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Kirim
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                id="uploadImage"
              />
              <label
                htmlFor="uploadImage"
                className="bg-green-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-green-700"
              >
                📷
              </label>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 my-auto">
            Pilih kontak untuk mulai chat
          </div>
        )}
      </div>
    </div>
  );
}
