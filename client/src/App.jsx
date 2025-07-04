import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const CONNECTION_PORT = "http://localhost:3001"; 

function App() {
  const [socket, setSocket] = useState(null);

  // before login
  const [loggedIn, setLoggedIn] = useState(false);
  const [room, setRoom] = useState("");
  const [userName, setUserName] = useState("");

  // after login
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  // connect socket once
  useEffect(() => {
    const newSocket = io(CONNECTION_PORT);
    setSocket(newSocket);

    return () => newSocket.disconnect(); 
  }, []);

  // set up listener for receiving messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      setMessageList((prev) => [...prev, data]); 
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  const connectToRoom = () => {
    if (socket && room !== "") {
      socket.emit("join_room", room);
      setLoggedIn(true);
    }
  };

  const sendMessage = async () => {
    if (socket && message.trim() !== "") {
      const messageContent = {
        room: room,
        content: {
          author: userName,
          message: message.trim(),
        },
      };
      await socket.emit("send_message", messageContent);
      setMessageList((prev) => [...prev, messageContent.content]);
      setMessage("");
    }
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);


  return (
    <div className="App">
      {!loggedIn ? (
        <div className="logIn">
          <div className="inputs">
            <input
              type="text"
              placeholder="name..."
              onChange={(e) => setUserName(e.target.value)}
            />
            <input
              type="text"
              placeholder="room..."
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>
          <button onClick={connectToRoom}>enter chat</button>
        </div>
      ) : (
        <div className="chatContainer">
          <div className="messages">
            {messageList.map((val, key) => {
              return (
                <div
                  key={key}
                  className="messageContainer"
                  id={val.author === userName ? "you" : "other"}
                >
                  <div className="messageIndividual">
                    {val.author}: {val.message}
                  </div>
                </div>
              );
            })}
          </div>
          <div ref= {messagesEndRef}className="messageInputs">
            <input
              type="text"
              value={message}
              placeholder="message..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
