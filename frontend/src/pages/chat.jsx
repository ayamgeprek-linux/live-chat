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
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val() || {};
      const messageList = Object.values(data).sort((a, b) => a.time - b.time);
      setMessages(messageList);

      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    return () => unsubscribe();
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
      time: Date.now(),
    });
    setText("");

    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isSameDay = (ts1, ts2) => {
    const d1 = new Date(ts1);
    const d2 = new Date(ts2);
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isToday = (ts) => {
    const today = new Date();
    const date = new Date(ts);
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  const isYesterday = (ts) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const date = new Date(ts);
    return (
      yesterday.getDate() === date.getDate() &&
      yesterday.getMonth() === date.getMonth() &&
      yesterday.getFullYear() === date.getFullYear()
    );
  };

  const formatDateLabel = (ts) => {
    if (isToday(ts)) return "Hari Ini";
    if (isYesterday(ts)) return "Kemarin";
    const d = new Date(ts);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
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
        <div className="flex flex-col">
          <p className="text-sm font-bold">{state?.name || state?.email}</p>
          <p className="text-xs text-white/80">Terakhir dilihat 3:40:49 PM</p>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => {
          const showDateSeparator =
            index === 0 ||
            !isSameDay(messages[index - 1]?.time, msg.time);

          return (
            <React.Fragment key={index}>
              {showDateSeparator && (
                <div className="flex justify-center my-2">
                  <div className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full">
                    {formatDateLabel(msg.time)}
                  </div>
                </div>
              )}
              <div
                className={`flex ${
                  msg.from === auth.currentUser.uid
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`p-2 rounded-lg max-w-[70%] break-words flex flex-col ${
                    msg.from === auth.currentUser.uid
                      ? "bg-blue-500 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  <span>{msg.text}</span>
                  <span
                    className={`text-[10px] mt-1 self-end ${
                      msg.from === auth.currentUser.uid
                        ? "text-white/70"
                        : "text-black/60"
                    }`}
                  >
                    {formatTime(msg.time)}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
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
