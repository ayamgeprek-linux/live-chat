import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onValue, ref, set, getDatabase } from "firebase/database";
import { auth, db } from "../firebase";
import { Menu, X } from "lucide-react";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserPhoto, setCurrentUserPhoto] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [previewPhotoURL, setPreviewPhotoURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [lastMessages, setLastMessages] = useState({});
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    if (!currentUser) return;
    const userRef = ref(db, "users/" + currentUser.uid);

    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentUserName(data.name || currentUser.email);
        setCurrentUserPhoto(data.photoURL || "https://via.placeholder.com/80");
        setNewName(data.name || "");
      }
    });

    const usersRef = ref(db, "users/");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.keys(data)
          .map((uid) => ({
            uid,
            email: data[uid].email,
            name: data[uid].name,
            photo: data[uid].photoURL || "https://via.placeholder.com/40",
          }))
          .filter((user) => user.email !== currentUser.email);
        setUsers(userList);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const db = getDatabase();
    const chatsRef = ref(db, "chats/");

    onValue(chatsRef, (snapshot) => {
      const chats = snapshot.val() || {};
      const latestMessages = {};
      Object.keys(chats).forEach((roomId) => {
        const messages = Object.values(chats[roomId]);
        const lastMessage = messages[messages.length - 1];
        if (
          lastMessage?.from === currentUser.uid ||
          lastMessage?.to === currentUser.uid
        ) {
          const otherUid =
            lastMessage.from === currentUser.uid
              ? lastMessage.to
              : lastMessage.from;
          latestMessages[otherUid] = lastMessage;
        }
      });
      setLastMessages(latestMessages);
    });
  }, [currentUser]);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await toBase64(file);
      setNewPhotoFile(base64);
      setPreviewPhotoURL(base64);
    }
  };

  const handleSaveProfile = async () => {
    if (!newName || !currentUser) return;

    setLoading(true);
    let photoURL = previewPhotoURL || currentUserPhoto;

    try {
      const userRef = ref(db, "users/" + currentUser.uid);
      await set(userRef, {
        email: currentUser.email,
        name: newName,
        photoURL: photoURL,
      });

      setCurrentUserPhoto(photoURL);
      setCurrentUserName(newName);
      setNewPhotoFile(null);
      setPreviewPhotoURL(null);
      setShowEditMenu(false);
    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
    }

    setLoading(false);
  };

  const handleUserClick = (user) => {
    navigate("/chat", {
      state: {
        uid: user.uid,
        email: user.email,
        photo: user.photo,
        name: user.name,
      },
    });
  };

  const sortedUsers = users.sort((a, b) => {
    const aTime = lastMessages[a.uid]?.time || 0;
    const bTime = lastMessages[b.uid]?.time || 0;
    return bTime - aTime;
  });

  return (
    <div className="flex flex-col h-screen bg-[#f1f1f1] text-black">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={previewPhotoURL || currentUserPhoto}
            alt="profil"
            className="w-12 h-12 rounded-full border"
          />
          <div>
            <p className="font-bold text-sm">{currentUserName}</p>
            <p className="text-xs text-gray-600">{currentUser?.email}</p>
          </div>
        </div>
        <button onClick={() => setShowEditMenu(!showEditMenu)}>
          {showEditMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Edit Profile */}
      {showEditMenu && (
        <div className="p-4 border-b bg-white flex flex-col gap-2 animate-slide-down">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama baru"
            className="p-2 border rounded"
          />
          <label className="cursor-pointer text-blue-600">
            <span className="underline">Pilih Foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </label>
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className={`bg-blue-600 text-white px-3 py-2 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      )}

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedUsers.map((user) => (
          <div
            key={user.uid}
            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-200"
            onClick={() => handleUserClick(user)}
          >
            <img
              src={user.photo}
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold text-sm">{user.name || user.email}</p>
              <p className="text-xs text-gray-500">
                {lastMessages[user.uid]?.text
                  ? lastMessages[user.uid].text.slice(0, 30)
                  : "Online"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
          onClick={() => {
            auth.signOut();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
