import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  getDatabase,
  ref,
  push,
  onValue,
  serverTimestamp,
} from "firebase/database";

export default function Chat() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatEndRef = useRef();

  useEffect(() => {
    if (!state?.uid) {
      navigate("/home");
    }
  }, [state, navigate]);

  const roomId =
    auth.currentUser.uid < state.uid
      ? `${auth.currentUser.uid}_${state.uid}`
      : `${state.uid}_${auth.currentUser.uid}`;

  useEffect(() => {
    const db = getDatabase();
    const chatRef = ref(db, `chats/${roomId}`);
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      const messageList = Object.values(data);
      setMessages(messageList);
      scrollToBottom();
    });
  }, [roomId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const db = getDatabase();
    const chatRef = ref(db, `chats/${roomId}`);
    await push(chatRef, {
      from: auth.currentUser.uid,
      to: state.uid,
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
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header Chat */}
      <div className="p-4 bg-blue-600 text-white font-semibold flex items-center gap-3 shadow">
        <button
          onClick={() => navigate("/home")}
          className="text-white text-lg"
        >
          ←
        </button>
        <img
          src={state?.photo || "https://via.placeholder.com/40"}
          alt="avatar"
          className="w-9 h-9 rounded-full border"
        />
        <div>
          <p className="text-sm font-bold">{state?.name || state?.email}</p>
          <p className="text-xs text-gray-100">{state?.email}</p>
        </div>
      </div>

      {/* Pesan-pesan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.from === auth.currentUser.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-[70%] break-words ${
                msg.from === auth.currentUser.uid
                  ? "bg-blue-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              <div>{msg.text}</div>
              <div className="text-[10px] text-gray-300 mt-1 text-right">
                {formatTime(msg.time)}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Pesan */}
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
