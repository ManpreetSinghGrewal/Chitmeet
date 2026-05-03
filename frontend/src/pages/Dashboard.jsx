import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Video, MessageSquare, LogOut, Hash, Shuffle, Check, UserPlus } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const fetchData = async () => {
    try {
      if (!user) return;
      
      const [roomsRes, countRes, friendsRes] = await Promise.all([
        axios.get(`${API_URL}/api/rooms`),
        axios.get(`${API_URL}/api/users/online-count`),
        axios.get(`${API_URL}/api/users/${user._id}/friends`)
      ]);
      
      setRooms(roomsRes.data);
      setOnlineCount(countRes.data.count);
      setFriends(friendsRes.data.friends || []);
      setFriendRequests(friendsRes.data.friendRequests || []);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    if (socket) {
      const handleUserStatusChange = () => fetchData();
      socket.on('user-online', handleUserStatusChange);
      socket.on('user-offline', handleUserStatusChange);

      socket.on('match-found', (data) => {
        setIsSearching(false);
        // data contains roomId and partnerUserId
        navigate(`/chat/${data.roomId}`, { state: { partnerUserId: data.partnerUserId } });
      });

      return () => {
        socket.off('user-online', handleUserStatusChange);
        socket.off('user-offline', handleUserStatusChange);
        socket.off('match-found');
      };
    }
  }, [socket, navigate]);

  const handleRandomMatch = () => {
    if (socket) {
      setIsSearching(true);
      socket.emit('join-random');
    }
  };

  const acceptRequest = async (fromUserId) => {
    try {
      await axios.post(`${API_URL}/api/users/friend-request/accept`, {
        userId: user._id,
        fromUserId
      });
      fetchData(); // Refresh lists
    } catch (error) {
      console.error('Error accepting friend request', error);
      alert('Could not accept request');
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="glass-panel sidebar">
        <div className="sidebar-header">
          <MessageSquare size={24} color="var(--accent-primary)" />
          <span className="heading-md" style={{ marginLeft: '0.5rem' }}>ChitMeet</span>
        </div>

        <div className="sidebar-nav">
          <h4 className="nav-title">Profile</h4>
          <div style={{ marginBottom: '1.5rem' }}>
            <p className="text-body" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-small">{user?.hostelBlock}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
              <div className="online-indicator" style={{ position: 'static' }}></div>
              {onlineCount} Users Online
            </div>
          </div>

          {friendRequests.length > 0 && (
            <>
              <h4 className="nav-title" style={{ color: '#f59e0b' }}>Friend Requests ({friendRequests.length})</h4>
              <ul className="friend-list" style={{ marginBottom: '1.5rem' }}>
                {friendRequests.map(req => (
                  <li key={req._id} className="friend-item" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div className="friend-info" style={{ flex: 1 }}>
                      <span className="friend-name">{req.name}</span>
                      <span className="friend-hostel">{req.hostelBlock}</span>
                    </div>
                    <button 
                      className="icon-btn" 
                      onClick={() => acceptRequest(req._id)}
                      title="Accept Request"
                      style={{ background: '#10b981', color: 'white' }}
                    >
                      <Check size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h4 className="nav-title">Your Friends ({friends.length})</h4>
          <ul className="friend-list">
            {friends.map(friend => (
              <li key={friend._id} className="friend-item">
                <div className="avatar-placeholder">
                  {friend.name.charAt(0).toUpperCase()}
                  {friend.isOnline && <div className="online-indicator"></div>}
                </div>
                <div className="friend-info">
                  <span className="friend-name">{friend.name}</span>
                  <span className="friend-hostel">{friend.isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </li>
            ))}
            {friends.length === 0 && (
              <p className="text-small text-muted">You haven't added any friends yet. Meet people in Omegle Mode!</p>
            )}
          </ul>
        </div>

        <div className="sidebar-footer">
          <button className="btn btn-secondary w-100" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header flex-between glass-panel">
          <div>
            <h2 className="heading-lg">Rooms</h2>
            <p className="text-body">Join a room to start chatting.</p>
          </div>
          
          <div className="search-bar input-with-icon">
            <Search size={18} className="input-icon" />
            <input type="text" className="input-field" placeholder="Search rooms or people..." />
          </div>
        </header>

        {/* Omegle Feature Banner */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'var(--bg-glass-hover)', border: '1px solid var(--accent-primary)' }}>
          <h3 className="heading-lg" style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>Omegle Mode</h3>
          <p className="text-body" style={{ marginBottom: '1.5rem' }}>Connect with a random student instantly. Video and Mic are enabled!</p>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={handleRandomMatch}
            disabled={isSearching}
          >
            {isSearching ? 'Searching for a partner...' : <><Shuffle size={20} /> Connect Randomly</>}
          </button>
        </div>

        <div className="rooms-grid">
          {rooms.map(room => (
            <div key={room._id} className="glass-card room-card">
              <div className="room-card-header flex-between">
                <div className="room-icon flex-center">
                  <Hash size={24} color="var(--accent-primary)" />
                </div>
                <span className="badge">{room.activeUsers || 0} online</span>
              </div>
              <h3 className="heading-md room-title">{room.name}</h3>
              <p className="text-small" style={{ marginBottom: '1rem', color: '#ef4444' }}>NO MIC ALLOWED</p>
              <div className="room-types">
                {(room.type === 'video' || room.type === 'both') && (
                  <span className="type-indicator"><Video size={14} /> Cam</span>
                )}
                {(room.type === 'text' || room.type === 'both') && (
                  <span className="type-indicator"><MessageSquare size={14} /> Text</span>
                )}
              </div>
              <button 
                className="btn btn-primary w-100 mt-4"
                onClick={() => navigate(`/chat/${room.roomId}`)}
              >
                Join Room
              </button>
            </div>
          ))}
          {rooms.length === 0 && <p className="text-muted">No rooms available. Seed the database to get started.</p>}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
