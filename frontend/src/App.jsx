import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";
import Chat from "./pages/chat"; // ✅ Tambahkan ini
import VideoCall from "./components/videocall";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<Chat />} /> {/* ✅ Tambahkan ini */}
        <Route path="/call/:id" element={<VideoCall />} />
      </Routes>
    </Router>
  );
}

export default App;
