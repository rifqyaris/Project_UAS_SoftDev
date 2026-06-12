"use client";

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { io } from "socket.io-client";

const socket = io("https://exquisite-acceptance-production-3bb9.up.railway.app");

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [activeRoom, setActiveRoom] = useState("");
  const [activeTargetName, setActiveTargetName] = useState("");
  const [activeBarangName, setActiveBarangName] = useState("");
  
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [messageList, setMessageList] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const fetchRooms = (userId: string) => {
  fetch(
    `https://exquisite-acceptance-production-3bb9.up.railway.app/api/chat/rooms/${userId}`
  )
    .then((res) => res.json())
    .then((data) => setChatRooms(data));
};

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return router.push("/unauthorized");
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    socket.emit("join_user_global", parsedUser._id);

    const urlRoom = searchParams.get('room');
    const urlTarget = searchParams.get('target');
    const urlBarang = searchParams.get('barang');

    if (urlRoom) {
      setActiveRoom(urlRoom);
      setActiveTargetName(urlTarget || "Diskusi");
      setActiveBarangName(urlBarang || "Barang");
    }

    fetch( `https://exquisite-acceptance-production-3bb9.up.railway.app/api/chat/rooms/${parsedUser._id}`)
      .then(res => res.json())
      .then(data => {
        setChatRooms(data);
        if (!urlRoom && data.length > 0) {
          handleSelectRoom(data[0], parsedUser);
        }
      });

    socket.on("refresh_sidebar", () => {
      fetchRooms(parsedUser._id);
    });

    return () => {
      socket.off("refresh_sidebar");
    };
  }, [searchParams, router]);

  useEffect(() => {
    if (!activeRoom) return;

    socket.emit("join_room", activeRoom);

  fetch(
    `https://exquisite-acceptance-production-3bb9.up.railway.app/api/chat/messages/${activeRoom}`
  )
    .then((res) => res.json())
    .then((data) => setMessageList(data));

    const handleReceive = (data: any) => {
      if (data.room === activeRoom) {
        setMessageList((list) => [...list, data]);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => { socket.off("receive_message", handleReceive); };
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  const handleSelectRoom = (roomData: any, currentUser: any) => {
    const identity = currentUser || user;
    const isDonatur = roomData.donaturId === identity._id;
    
    setActiveRoom(roomData.room);
    setActiveBarangName(roomData.barangNama);
    setActiveTargetName(isDonatur ? roomData.peminatNama : roomData.donaturNama);
  };

  const sendMessage = async () => {
    if (currentMessage.trim() !== "" && activeRoom) {
      const messageData = {
        room: activeRoom,
        author: user.nama,
        message: currentMessage,
        time: new Date().getHours() + ":" + (new Date().getMinutes() < 10 ? '0' : '') + new Date().getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      fetchRooms(user._id);
    }
  };

  if (!user) return null;

  return (
    <div className="container-fluid py-4 bg-light" style={{ minHeight: "100vh" }}>
      <div className="container bg-white rounded-4 shadow-sm overflow-hidden p-0 border" style={{ height: "85vh" }}>
        <div className="row g-0 h-100">
          
          {/* SIDEBAR KIRI */}
          <div className="col-md-4 border-end h-100 d-flex flex-column bg-white">
            <div className="p-3 border-bottom bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="fw-bold m-0">💬 Daftar Pesan</h5>
              <Link href="/dashboard" className="btn btn-sm btn-light text-success fw-bold rounded-pill">Dasbor</Link>
            </div>
            
            <div className="flex-grow-1 overflow-auto">
              {chatRooms.length === 0 ? (
                <div className="text-center text-muted small mt-5 p-3">Belum ada daftar obrolan aktif.</div>
              ) : (
                chatRooms.map((roomItem) => {
                  const isDonatur = roomItem.donaturId === user._id;
                  const lawanBicara = isDonatur ? roomItem.peminatNama : roomItem.donaturNama;
                  const isActive = roomItem.room === activeRoom;

                  return (
                    <div 
                      key={roomItem.room} 
                      onClick={() => handleSelectRoom(roomItem, user)}
                      className={`p-3 border-bottom d-flex align-items-center gap-3 ${isActive ? "bg-success bg-opacity-10 border-start border-success border-4" : ""}`}
                      style={{ cursor: "pointer", transition: "0.2s" }}
                    >
                      <div className="bg-secondary bg-opacity-25 rounded-circle d-flex justify-content-center align-items-center fw-bold text-secondary" style={{ width: "45px", height: "45px", minWidth: "45px" }}>
                        {lawanBicara.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow-1 text-truncate">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0 fw-bold text-dark">{lawanBicara}</h6>
                          <small className="text-muted" style={{ fontSize: "10px" }}>{roomItem.time}</small>
                        </div>
                        <small className="text-success fw-semibold d-block text-truncate" style={{ fontSize: "12px" }}>📦 {roomItem.barangNama}</small>
                        <small className="text-muted text-truncate d-block" style={{ fontSize: "12px" }}>{roomItem.lastMessage}</small>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* AREA CHAT KANAN */}
          <div className="col-md-8 h-100 d-flex flex-column bg-light">
            {activeRoom ? (
              <>
                <div className="bg-white p-3 border-bottom d-flex align-items-center gap-3 shadow-sm">
                  <div className="bg-success bg-opacity-25 rounded-circle d-flex justify-content-center align-items-center text-success fw-bold" style={{ width: "45px", height: "45px" }}>
                    {activeTargetName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h6 className="m-0 fw-bold text-dark">{activeTargetName}</h6>
                    <small className="text-muted">Membahas barang: <span className="text-success fw-bold">{activeBarangName}</span></small>
                  </div>
                </div>

                <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3" style={{ backgroundColor: "#f8f9fa" }}>
                  {messageList.map((msg, index) => {
                    const isMe = msg.author?.trim().toLowerCase() === user.nama?.trim().toLowerCase();
                    return (
                      <div key={index} className={`d-flex flex-column ${isMe ? "align-items-end" : "align-items-start"}`}>
                        <div className={`p-3 rounded-4 shadow-sm ${isMe ? "bg-success text-white" : "bg-white text-dark border"}`} style={{ maxWidth: "70%" }}>
                          <div className="fw-bold small mb-1" style={{ opacity: isMe ? 0.8 : 0.5 }}>{isMe ? "Anda" : msg.author}</div>
                          <div style={{ wordBreak: "break-word" }}>{msg.message}</div>
                        </div>
                        <span className="text-muted mt-1 px-1" style={{ fontSize: "10px" }}>{msg.time}</span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 bg-white border-top">
                  <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                    <input 
                      type="text" 
                      className="form-control ps-4 py-3 border-0" 
                      placeholder="Tulis balasan pesan Anda..." 
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => { e.key === "Enter" && sendMessage(); }}
                    />
                    <button className="btn btn-success px-4 fw-bold border-0" onClick={sendMessage}>Kirim 🚀</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="my-auto text-center text-muted">
                <span style={{ fontSize: "60px" }}>💬</span>
                <h5 className="mt-3 fw-bold">Selamat Datang di Obrolan DonasiKu</h5>
                <p className="small px-4">Pilih salah satu daftar nama obrolan di sebelah kiri untuk mulai berdiskusi tentang penyerahan donasi barang.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-success"></div></div>}>
      <ChatContent />
    </Suspense>
  );
}