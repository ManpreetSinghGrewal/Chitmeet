import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, Send, Smile, Paperclip } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import './ChatRoom.css';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) navigate('/auth');
  }, [user, navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5001/api/rooms/${roomId}/messages`);
        setMessages(data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages', error);
      }
    };
    fetchMessages();
  }, [roomId]);

  useEffect(() => {
    if (socket) {
      socket.emit('join-room', roomId);

      socket.on('receive-message', (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      });

      return () => {
        socket.off('receive-message');
      };
    }
  }, [socket, roomId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !user) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageData = {
      roomId,
      senderId: user._id,
      senderName: user.name,
      text: message,
      time
    };

    socket.emit('send-message', messageData);
    setMessage('');
  };

  return (
    <div className="chatroom-container">
      <header className="chatroom-header flex-between glass-panel">
        <div className="flex-center" style={{ gap: '1rem' }}>
          <button className="icon-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="heading-md">Room: {roomId}</h2>
          </div>
        </div>
      </header>

      <div className="chatroom-body">
        {/* Video Area */}
        <div className="video-area">
          <div className="video-grid">
            <div className="video-tile local-video">
              <div className="video-placeholder flex-center">
                <Video size={48} color="var(--text-muted)" />
              </div>
              <div className="participant-label">You</div>
            </div>
          </div>

          <div className="video-controls glass-panel flex-center">
            <button 
              className={`control-btn ${isAudioMuted ? 'muted' : ''}`}
              onClick={() => setIsAudioMuted(!isAudioMuted)}
            >
              {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              className={`control-btn ${isVideoMuted ? 'muted' : ''}`}
              onClick={() => setIsVideoMuted(!isVideoMuted)}
            >
              {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
            <button className="control-btn end-call-btn" onClick={() => navigate('/dashboard')}>
              <PhoneOff size={20} color="white" />
            </button>
          </div>
        </div>

        {/* Text Chat Area */}
        <div className="chat-area glass-panel">
          <div className="chat-messages">
            {messages.map((msg, index) => {
              const isMine = user && msg.senderId === user._id;
              return (
                <div key={msg._id || index} className={`message-bubble-container ${isMine ? 'mine' : 'theirs'}`}>
                  {!isMine && <span className="message-sender">{msg.senderName}</span>}
                  <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                    {msg.text}
                  </div>
                  <span className="message-time">{msg.time}</span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <button type="button" className="icon-btn text-muted"><Paperclip size={20} /></button>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Type a message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="button" className="icon-btn text-muted"><Smile size={20} /></button>
            <button type="submit" className="icon-btn send-btn"><Send size={18} color="white" /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
