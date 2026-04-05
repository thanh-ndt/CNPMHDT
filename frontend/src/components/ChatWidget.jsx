import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Button, Card, Form, ListGroup } from 'react-bootstrap';

const ChatWidget = () => {
    const { user } = useSelector(state => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    
    // States for Chat
    const [roomId, setRoomId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // States for owner
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    
    useEffect(() => {
        if (!user) return;
        
        const newSocket = io('https://cnpmhdt.onrender.com');
        setSocket(newSocket);

        // Lắng nghe custom event từ các component khác để mở chat
        const openChat = () => setIsOpen(true);
        window.addEventListener('open-chat-widget', openChat);
        
        return () => {
            newSocket.close();
            window.removeEventListener('open-chat-widget', openChat);
        };
    }, [user]);

    useEffect(() => {
        if (!user || !isOpen) return;

        const fetchInitData = async () => {
            try {
                if (user.role === 'owner') {
                    const res = await axios.get(`https://cnpmhdt.onrender.com/api/chat/rooms?userId=${user._id}&role=owner`);
                    if (res.data.success) {
                        setRooms(res.data.data);
                    }
                } else {
                    const res = await axios.get(`https://cnpmhdt.onrender.com/api/chat/customer-room/${user._id}`);
                    if (res.data.success) {
                        const rId = res.data.data._id;
                        setRoomId(rId);
                        
                        const msgs = await axios.get(`https://cnpmhdt.onrender.com/api/chat/messages/${rId}`);
                        if (msgs.data.success) {
                            setMessages(msgs.data.data);
                        }
                    }
                }
            } catch (err) {
                console.error("Lỗi lấy thông tin chat", err);
            }
        };
        fetchInitData();
    }, [user, isOpen]);

    useEffect(() => {
        if (socket && roomId) {
            socket.emit('join_room', { roomId });
            
            const handleReceiveMessage = (message) => {
                setMessages(prev => [...prev, message]);
                // Nếu đang đóng widget thì tăng unread count (chỉ khi tin nhắn từ người khác)
                if (!isOpen && user && message.senderId !== user._id) {
                    setUnreadCount(prev => prev + 1);
                }
            };

            socket.on('receive_message', handleReceiveMessage);

            return () => {
                socket.off('receive_message', handleReceiveMessage);
            };
        }
    }, [socket, roomId, isOpen, user?._id]);

    // Reset unread khi mở chat
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, selectedRoom]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !roomId || !socket) return;

        socket.emit('send_message', {
            roomId: roomId,
            senderId: user?._id,
            content: input.trim()
        });

        setInput('');
    };

    const handleSelectRoom = async (room) => {
        setRoomId(room._id);
        setSelectedRoom(room);
        try {
            const msgs = await axios.get(`https://cnpmhdt.onrender.com/api/chat/messages/${room._id}`);
            if (msgs.data.success) {
                setMessages(msgs.data.data);
            }
        } catch(err) {
            console.error(err);
        }
    };

    if (!user) return null; // Không hiển thị nếu chưa đăng nhập

    return (
        <>
            <Button
                variant="danger"
                className="rounded-circle shadow d-flex align-items-center justify-content-center"
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    zIndex: 9999
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <span className="fs-4">✖</span>
                ) : (
                    <>
                        <span className="fs-3">💬</span>
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                background: '#fff',
                                color: '#cc0000',
                                border: '2px solid #cc0000',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </>
                )}
            </Button>

            {isOpen && (
                <Card
                    className="shadow"
                    style={{
                        position: 'fixed',
                        bottom: '100px',
                        right: '30px',
                        width: '350px',
                        height: '500px',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {user.role === 'owner' && !selectedRoom ? (
                        <>
                            <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                                <strong>Tin nhắn Khách hàng</strong>
                            </Card.Header>
                            <ListGroup variant="flush" style={{ overflowY: 'auto', flex: 1 }}>
                                {rooms.map(room => (
                                    <ListGroup.Item 
                                        key={room._id} 
                                        action 
                                        onClick={() => handleSelectRoom(room)}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <strong>{room.customer?.fullName || room.customer?.email}</strong>
                                    </ListGroup.Item>
                                ))}
                                {rooms.length === 0 && (
                                    <div className="text-center text-muted p-4">Chưa có cuộc trò chuyện nào</div>
                                )}
                            </ListGroup>
                        </>
                    ) : (
                        <>
                            <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                                <strong>
                                    {user.role === 'owner' 
                                        ? `Chat với ${selectedRoom?.customer?.fullName || 'Khách'}` 
                                        : 'Chat với Cửa hàng'}
                                </strong>
                                {user.role === 'owner' && (
                                    <Button variant="light" size="sm" onClick={() => {
                                        setRoomId(null);
                                        setSelectedRoom(null);
                                        setMessages([]);
                                    }}>
                                        Trở lại
                                    </Button>
                                )}
                            </Card.Header>
                            <div className="p-3 bg-light" style={{ flex: 1, overflowY: 'auto' }}>
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user._id;
                                    return (
                                        <div key={idx} className={`mb-2 d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                                            <div
                                                className={`p-2 rounded shadow-sm ${isMe ? 'bg-danger text-white' : 'bg-white border'}`}
                                                style={{ maxWidth: '75%', wordWrap: 'break-word', fontSize: '0.95rem' }}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                            <Card.Footer className="bg-white p-2 border-top">
                                <Form onSubmit={handleSendMessage} className="d-flex gap-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="rounded-pill"
                                        style={{ backgroundColor: '#f0f2f5' }}
                                    />
                                    <Button type="submit" variant="danger" className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', padding: 0 }}>
                                        ➤
                                    </Button>
                                </Form>
                            </Card.Footer>
                        </>
                    )}
                </Card>
            )}
        </>
    );
};

export default ChatWidget;
