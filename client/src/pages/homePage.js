import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApolloProvider, useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import { useNhostAuth, signInWithEmailPassword, signUpWithEmailPassword, signOut, nhost } from '../utils/nhost';

import { createApolloClient } from '../utils/apollo';
import '../styles/homePage.css';

const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { updated_at: desc }) {
      id
      title
      updated_at
      messages(limit: 1, order_by: { created_at: desc }) {
        content
      }
    }
  }
`;

const GET_MESSAGES = gql`
  subscription GetMessages($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: asc }) {
      id
      role
      content
      created_at
    }
  }
`;

const CREATE_CHAT = gql`
  mutation CreateChat($title: String!) {
    insert_chats_one(object: { title: $title }) {
      id
      title
    }
  }
`;

const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $content: String!) {
    insert_messages_one(object: { chat_id: $chat_id, content: $content, role: "user" }) {
      id
    }
  }
`;

const SEND_MESSAGE_ACTION = gql`
  mutation SendMessage($chat_id: uuid!, $content: String!) {
    sendMessage(input: { chat_id: $chat_id, content: $content }) {
      message {
        id
      }
    }
  }
`;

const ChatPage = () => {
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const messageEndRef = useRef(null);
  const sidebarRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(380);

  const { data: chatsData, loading: chatsLoading, refetch: refetchChats } = useQuery(GET_CHATS);
  const { data: messagesData, loading: messagesLoading } = useSubscription(GET_MESSAGES, {
    variables: { chat_id: activeChat?.id },
    skip: !activeChat,
  });

  const [createChat] = useMutation(CREATE_CHAT);
  const [insertMessage] = useMutation(INSERT_MESSAGE);
  const [sendMessageAction, { loading: isTyping }] = useMutation(SEND_MESSAGE_ACTION);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const handleNewChat = async () => {
    const title = prompt("Enter a title for the new chat:", "New Chat");
    if (title) {
      try {
        const result = await createChat({ variables: { title } });
        await refetchChats();
        setActiveChat(result.data.insert_chats_one);
      } catch (error) {
        console.error("Error creating new chat:", error);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '' || !activeChat || isTyping) return;

    const messageContent = inputMessage;
    setInputMessage('');

    try {
      await insertMessage({
        variables: { chat_id: activeChat.id, content: messageContent },
      });
      await sendMessageAction({
        variables: { chat_id: activeChat.id, content: messageContent },
      });
      refetchChats();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    const handleMouseDown = (e) => {
      setIsResizing(true);
      document.body.classList.add('resizing');
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing');
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setSidebarWidth(newWidth);
        if (sidebarRef.current) {
          sidebarRef.current.style.width = `${newWidth}px`;
        }
      }
    };

    const resizeHandle = resizeHandleRef.current;
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', handleMouseDown);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (resizeHandle) {
        resizeHandle.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('resizing');
    };
  }, [isResizing]);

  return (
    <div className="home-page">
      <aside className="sidebar" ref={sidebarRef} style={{ width: `${sidebarWidth}px` }}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => navigate('/')}>
            <span className="gradient-text">NeuralChat</span>
            <span className="ai-badge">AI</span>
          </div>
        </div>
        
        <div className="chat-list">
          <div className="list-header">
            <h3>Recent Chats</h3>
            <button className="new-chat-btn" onClick={handleNewChat}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="chat-items">
            {chatsLoading ? <p>Loading chats...</p> : chatsData?.chats.map(chat => (
              <div 
                key={chat.id} 
                className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`} 
                onClick={() => setActiveChat(chat)}
              >
                <div className="chat-info">
                  <div className="chat-title-row">
                    <h4>{chat.title}</h4>
                    <span className="chat-time">{formatTime(chat.updated_at)}</span>
                  </div>
                  <p className="chat-preview">{truncateText(chat.messages[0]?.content, 30)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="sidebar-footer">
            <button className="settings-btn" onClick={() => {
                nhost.auth.signOut();
                navigate('/auth');
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span>Sign Out</span>
            </button>
        </div>
        <div className={`resize-handle ${isResizing ? 'active' : ''}`} ref={resizeHandleRef}></div>
      </aside>
      
      <main className="chat-area">
        <div className="chat-header">
          <div className="chat-title">
            <h2>{activeChat ? activeChat.title : "Select a chat"}</h2>
            <div className="chat-subtitle">{activeChat ? "AI-powered conversation" : "Create a new chat to get started"}</div>
          </div>
        </div>
        
        <div className="messages-container">
          {messagesLoading && !messagesData && <p>Loading messages...</p>}
          {messagesData?.messages.map(message => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className={`message-bubble ${message.role}`}>
                <p>{message.content}</p>
                <div className="message-time">{formatTime(message.created_at)}</div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message ai">
              <div className="message-bubble ai typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messageEndRef} />
        </div>
        
        <form className="message-input" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            value={inputMessage} 
            onChange={(e) => setInputMessage(e.target.value)} 
            placeholder={activeChat ? "Type a message..." : "Select a chat to start"}
            disabled={!activeChat || isTyping}
          />
          
          <button type="submit" className="send-btn" disabled={!inputMessage.trim() || !activeChat || isTyping}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </main>
    </div>
  );
};

const HomePage = () => {
    const accessToken = nhost.auth.getAccessToken();
    const [apolloClient, setApolloClient] = useState(null);

    useEffect(() => {
        if (accessToken) {
            const client = createApolloClient(accessToken);
            setApolloClient(client);
        }
    }, [accessToken]);

    if (!apolloClient) {
        return <div>Loading...</div>;
    }

    return (
        <ApolloProvider client={apolloClient}>
            <ChatPage />
        </ApolloProvider>
    );
};

export default HomePage;
          
          