import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  getDatabase,
  ref,
  push,
  onValue,
  set,
  serverTimestamp,
  onDisconnect,
} from "firebase/database";

export default function Chat() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userStatus, setUserStatus] = useState(null);
  const chatEndRef = useRef();

  const db = getDatabase();
  const uid = auth.currentUser?.uid;
  const targetUid = state?.uid;

  useEffect(() => {
    if (!uid || !targetUid) {
      navigate("/home");
    }
  }, [uid, targetUid, navigate]);

  const roomId = uid < targetUid ? `${uid}_${targetUid}` : `${targetUid}_${uid}`;

  // 🔁 Listen chat messages
  useEffect(() => {
    const chatRef = ref(db, `chats/${roomId}`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      const messageList = Object.values(data);
      setMessages(messageList);
      scrollToBottom();
    });
    return () => unsubscribe();
  }, [roomId]);

  // ⏱️ Update user online status
  useEffect(() => {
    if (!uid) return;

    const statusRef = ref(db, `/status/${uid}`);
    const onlineStatus = {
      state: "online",
      last_changed: serverTimestamp(),
    };
    const offlineStatus = {
      state: "offline",
      last_changed: serverTimestamp(),
    };

    onDisconnect(statusRef).set(offlineStatus);
    set(statusRef, onlineStatus);
  }, [uid]);

  // 👁️ Listen to target user status
  useEffect(() => {
    if (!targetUid) return;

    const targetStatusRef = ref(db, `/status/${targetUid}`);
    const unsubscribe = onValue(targetStatusRef, (snapshot) => {
      const data = snapshot.val();
      setUserStatus(data);
    });
    return () => unsubscribe();
  }, [targetUid]);

  // ➤ Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const chatRef = ref(db, `chats/${roomId}`);
    await push(chatRef, {
      from: uid,
      to: targetUid,
      text,
      time: serverTimestamp(),
    });
    setText("");
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white font-semibold flex items-center gap-3 shadow">
        <button onClick={() => navigate("/home")} className="text-white text-lg">
          ←
        </button>
        <img
          src={state?.photo || "https://via.placeholder.com/40"}
          alt="avatar"
          className="w-9 h-9 rounded-full border"
        />
        <div>
          <p className="text-sm font-bold">{state?.name || state?.email}</p>
          <p className="text-xs text-gray-100">
            {userStatus?.state === "online"
              ? "Sedang online"
              : userStatus?.last_changed
              ? `Terakhir dilihat: ${formatTime(userStatus.last_changed)}`
              : "Status tidak tersedia"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.from === uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-[70%] break-words ${
                msg.from === uid
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t flex items-center gap-2 bg-white"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis pesan..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}
