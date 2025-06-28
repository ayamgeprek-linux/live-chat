import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { auth, db } from "../firebase";
import { ref, onValue, set, remove } from "firebase/database";
import { useParams, useNavigate } from "react-router-dom";

export default function VideoCall() {
  const { id: remoteUserId } = useParams(); // ID user lawan bicara
  const currentUser = auth.currentUser;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const navigate = useNavigate();

  const signalRef = ref(db, `signals/${currentUser.uid}_${remoteUserId}`);
  const incomingSignalRef = ref(db, `signals/${remoteUserId}_${currentUser.uid}`);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const startCall = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setStream(mediaStream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = mediaStream;
    }

    const initiator = currentUser.uid < remoteUserId;
    const newPeer = new Peer({ initiator, trickle: false, stream: mediaStream });

    setPeer(newPeer);
    setIsCalling(true);

    if (initiator) {
      newPeer.on("signal", (data) => {
        set(signalRef, { from: currentUser.uid, signal: data });
      });

      onValue(incomingSignalRef, (snapshot) => {
        const val = snapshot.val();
        if (val?.signal) {
          newPeer.signal(val.signal);
        }
      });
    } else {
      onValue(signalRef, (snapshot) => {
        const val = snapshot.val();
        if (val?.signal) {
          newPeer.signal(val.signal);
        }
      });

      newPeer.on("signal", (data) => {
        set(incomingSignalRef, { from: currentUser.uid, signal: data });
      });
    }

    newPeer.on("stream", (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    newPeer.on("close", cleanup);
    newPeer.on("error", (err) => {
      console.error("Peer error:", err);
      cleanup();
    });
  };

  const cleanup = () => {
    if (peer) peer.destroy();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    remove(signalRef);
    remove(incomingSignalRef);
    setIsCalling(false);
    setPeer(null);
    setStream(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <h2 className="text-lg font-bold mb-4">
        Panggilan dengan: <span className="text-blue-600">{remoteUserId}</span>
      </h2>

      <div className="flex gap-4 mb-6">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-64 h-48 bg-black rounded"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-64 h-48 bg-black rounded"
        />
      </div>

      {!isCalling ? (
        <button
          onClick={startCall}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          📞 Panggil
        </button>
      ) : (
        <button
          onClick={() => {
            cleanup();
            navigate("/home");
          }}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          ❌ Tutup Panggilan
        </button>
      )}
    </div>
  );
}
