import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { auth } from "./firebase";
import { getDatabase, ref, onDisconnect, set, onValue, serverTimestamp } from "firebase/database";

import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import Chat from "./pages/chat";
import VideoCall from "./components/videocall";

// Fungsi untuk setup presence tracking
function setupPresenceTracking() {
  const db = getDatabase();
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const userStatusDatabaseRef = ref(db, "/status/" + uid);

  const isOfflineForDatabase = {
    state: "offline",
    last_changed: serverTimestamp(),
  };

  const isOnlineForDatabase = {
    state: "online",
    last_changed: serverTimestamp(),
  };

  const connectedRef = ref(db, ".info/connected");
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
      set(userStatusDatabaseRef, isOnlineForDatabase);
    });
  });
}

function App() {
  useEffect(() => {
    const interval = setInterval(() => {
      if (auth.currentUser) {
        setupPresenceTracking();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/call/:id" element={<VideoCall />} />
      </Routes>
    </Router>
  );
}

export default App;
