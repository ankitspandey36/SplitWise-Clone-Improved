import React, { useEffect, useState, useRef } from 'react'
import { socket } from '../../features/clientsocket.js'
import { axiosInstance } from '../../features/axios.js'
import { useParams } from 'react-router-dom';

function Message() {
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const { groupId } = useParams();
  const prevGroupIdRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
   (async () => {
      try {
        const res = await axiosInstance.get("/user/me");
        setUserId(res.data.data._id);
      } catch (error) {
        alert("Failed to fetch user ID", error);
      }
    })();

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = (data) => {
      setTypingUsers(prev => {
        const newTypingUsers = {...prev};
        newTypingUsers[data.userId] = Date.now();
        return newTypingUsers;
      });
    };

    socket.on("receive", handleMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receive", handleMessage);
      socket.off("typing", handleTyping);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const filtered = Object.fromEntries(
          Object.entries(prev).filter(([_, time]) => now - time < 3000)
        );
        return filtered;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      if (!groupId) return;
      const res = await axiosInstance.get(`/group/${groupId}/get-message`);
      console.log(res.data.data);
      
      setMessages(res.data.data || []);

      if (prevGroupIdRef.current && prevGroupIdRef.current !== groupId) {
        socket.emit("leave-room", prevGroupIdRef.current);
      }
      socket.emit("join-room", groupId);
      prevGroupIdRef.current = groupId;
    })();
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);

    socket.emit("typing", { userId, groupId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
    }, 3000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msgObj = {
      message: input,
      sentBy: userId,
      updatedAt: Date.now(),
      roomId: groupId
    };

    setMessages(prev => [...prev, msgObj]);
    await axiosInstance.post(`/group/${groupId}/save-message`, { message: input });
    socket.emit("new-message", msgObj);
    setInput("");
  };

  const typingUserIds = Object.keys(typingUsers).filter(id => id !== userId);
  const typingText = typingUserIds.length
    ? typingUserIds.length === 1
      ? "Someone is typing..."
      : "Several people are typing..."
    : "";
  
  
  if (!userId) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl flex flex-col h-[40rem] items-center justify-center">
        <p className="text-gray-500">Loading chat...</p>
      </div>
    );
  }

 return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl flex flex-col h-[40rem]">
      {/* Messages container: grow and scroll */}
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-3 bg-gray-100">
        {messages.map((msg, idx) => {
          const isUser = msg.sentBy === userId;
          return (
            <div 
              key={idx} 
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div className={`
                max-w-[70%] px-4 py-2 rounded-2xl shadow 
                ${isUser ? "bg-violet-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm"}
              `}>
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <div className="text-xs text-right opacity-50 mt-1">
                  {msg.updatedAt ? new Date(msg.updatedAt).toLocaleTimeString() : ""}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingText && (
        <div className="px-4 py-1 text-sm italic text-gray-500">
          {typingText}
        </div>
      )}

      <form 
        onSubmit={sendMessage} 
        className="flex items-center gap-2 p-3 bg-white border-t sticky bottom-0"
      >
        <input
          type="text"
          placeholder="Type your message…"
          value={input}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-violet-600"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-5 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default Message