import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { EventEnums } from "../utils/index";

import { useChats } from "../context/ChatContext";
import ChatHeader from "../components/chat/ChatHeader";
import LocalStorage from "../utils/LocalStorage";
import toast from "react-hot-toast";
import { handleRequest } from "../utils/handleRequest";
import { getChatMessages, getUserChats } from "../utils/api";
import { AiOutlineSearch } from "react-icons/ai";
import ChatMenuCard from "../components/chat/ChatMenuCard";

const Chat = () => {
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const { logout } = useAuth();
  const { socket } = useSocket();
  const [msgLoading, setMsgLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  // const currentChatref = useRef();
  const [currentChat, setCurrentChat] = useState();
  const [isSideBar, setIsSidebar] = useState(true);

  const toggleSideBar = () => setIsSidebar(!isSideBar);

  const onCardClick = (chat) => {
    if (currentChat?._id && currentChat?._id === chat._id) return;

    LocalStorage.set("currentChat", chat);
    setCurrentChat(chat);
    setMessage("");
    setMessages();
  };

  const onChatNameChange = (data) => {
    console.log("name changed");

    const { payload } = data;

    if (payload._id === currentChat?._id) {
      setCurrentChat(payload);
      LocalStorage.set("currentChat", payload);
    }

    setChats((prev) => [
      ...prev.map((c) => {
        if (c._id === payload._id) {
          return payload;
        }

        return c;
      }),
    ]);
  };

  const onDeleteChat = (chatId) => {
    console.log(chatId);
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));

    if (currentChat?._id === chatId) {
      setCurrentChat(null);
      LocalStorage.remove("currentChat");
    }
  };

  const onConnect = () => {
    console.log("connected");
    setConnected(true);
  };

  const getMessages = () => {
    if (!currentChat?._id) return;

    if (!socket) return toast.error("Socket not available");

    socket.emit(EventEnums.JOINED_CHAT, {
      chatId: currentChat?._id,
    });

    // removing msg from current chat as those will be read
    setUnreadMessages(
      unreadMessages.filter((msg) => msg.chat !== currentChat?._id)
    );

    handleRequest(
      async () => await getChatMessages(currentChat?._id),
      setMsgLoading,
      (res) => {
        const { data } = res;
        setMessages(data || []);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const loadChats = async () => {
    handleRequest(
      async () => await getUserChats(),
      setLoading,
      (res) => {
        const { data } = res;

        setChats(data || []);
      },
      (errorMessage) => {
        toast.error(errorMessage);
      }
    );
  };

  const onNewChat = ({ payload }) => {
    setChats((prev) => [payload, ...prev]);
  };

  const onLeaveChat = ({ payload }) => {
    if (payload._id === currentChat?._id) {
      setCurrentChat(null);
      LocalStorage.remove("currentChat");
    }

    setChats((prev) => prev.filter((ch) => ch._id !== payload._id));
  };

  useEffect(() => {
    loadChats();

    const _currentChat = LocalStorage.get("currentChat");

    if (_currentChat) {
      setCurrentChat(_currentChat);

      socket?.emit(EventEnums.JOINED_CHAT, {
        chatId: currentChat?._id,
      });

      getMessages();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on(EventEnums.CONNECTED, onConnect);
    socket.on(EventEnums.UPDATE_GROUP_NAME, onChatNameChange);
    socket.on(EventEnums.NEW_CHAT, onNewChat);
    socket.on(EventEnums.LEAVE_CHAT, onLeaveChat);

    return () => {
      socket.off(EventEnums.CONNECTED, onConnect);
      socket.off(EventEnums.UPDATE_GROUP_NAME, onChatNameChange);
      socket.off(EventEnums.NEW_CHAT, onNewChat);
      socket.off(EventEnums.LEAVE_CHAT, onLeaveChat);
    };
  }, [socket, chats]);

  return (
    <>
      {loading ? (
        <h1>Loading</h1>
      ) : (
        <>
          <ChatHeader
            isSideBar={isSideBar}
            toggleSideBar={toggleSideBar}
            unreadCount={unreadMessages.length}
            loadChats={loadChats}
          />

          <div className="flex ">
            <div
              className={`w-full md:w-1/3 h-[calc(100vh-80px)] border-[2px] border-zinc-400  ${
                isSideBar ? "block" : "md:block hidden"
              }  `}
            >
              <div className="flex bg-zinc-800 items-center">
                <input
                  placeholder="Search chat..."
                  className="w-full py-3 bg-transparent px-2 text-white !outline-none placeholder:text-gray-500 md:px-4 md:text-base text-sm"
                />
                <AiOutlineSearch className="mx-1 text-2xl" />
              </div>

              <ul>
                {chats.map((chat, i) => (
                  <li key={i}>
                    <ChatMenuCard
                      chat={chat}
                      onClick={onCardClick}
                      isActive={chat._id === currentChat?._id}
                      unreadCount={
                        unreadMessages.filter((msg) => msg.partOf === chat._id)
                          .length
                      }
                      onChatDelete={onDeleteChat}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`w-full md:w-1/3 h-[calc(100vh-80px)]   ${
                !isSideBar ? "block" : "md:block hidden"
              }  `}
            ></div>

            {/* <ChatsScreen /> */}
          </div>
        </>
      )}
    </>
  );
};

export default Chat;
