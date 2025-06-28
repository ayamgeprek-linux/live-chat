import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { auth } from "../firebase";
import {
  getDatabase,
  ref,
  push,
  onValue,
} from "firebase/database";

export default function Chat() {
  const { state } = useLocation();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const chatEndRef = useRef();

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
      text,
      time: Date.now(),
    });
    setText("");
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 bg-blue-600 text-white font-semibold">
        Chat dengan {state?.email}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded max-w-xs ${
              msg.from === auth.currentUser.uid
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-white text-black"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="p-4 border-t flex items-center gap-2"
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
