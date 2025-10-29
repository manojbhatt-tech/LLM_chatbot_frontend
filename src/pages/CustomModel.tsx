import axios from "axios";
import CustomModelService from "../service/customModelService";
import { act, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Send,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Pencil,
  Delete,
  EllipsisVertical,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ChatService from "@/service/chatService";
import { set } from "date-fns";
import { toast as toastifyTost } from "react-toastify";
import MarkdownDisplay from "@/components/MarkdownDisplay";

interface Message {
  role: "user" | "assistant" | "ai";
  content: string;
  timestamp: Date;
}

interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
  lastMessage?: Message | null;
  messageCount?: number;
}

function App() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const scrollRef = useRef(null);
  // State Variables
  const [token, setToken] = useState(""); // Hugging Face API token
  const [verified, setVerified] = useState(false); // Whether token is valid
  const [models, setModels] = useState([]); // List of available models
  const [selectedModel, setSelectedModel] = useState(""); // Currently selected model
  const [messages, setMessages] = useState([]); // Chat history
  const [input, setInput] = useState(""); // User input text

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<any>({});
  const [currentChatLoading, setCurrentChatLoading] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameChatId, setRenameChatId] = useState("");
  const [renameInput, setRenameInput] = useState("");
  const [isReload, setIsReload] = useState(false);

  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(
    "http://localhost:8080/dashboard/share/"
  );

  const getSharedChat = async (id: any) => {
    setCurrentChatLoading(true);
    setActiveChat(id);
    const currentChatRes = await ChatService.getChatById(id);
    setCurrentChat(currentChatRes.data.data);
    setCurrentChatLoading(false);
  };

  // Fetch all chats on mount
  const fetchChats = async () => {
    try {
      console.log("Fetching chats...");
      const res = await ChatService.getChats("CUSTOM_MODEL");
      console.log("chats data : ", res.data.data);
      setChats(res.data.data);
      if (!activeChat && res.data.data.length > 0) {
        setActiveChat(res.data.data[0]._id);
        const currentChatRes = await ChatService.getChatById(
          res.data.data[0]._id
        );
        setCurrentChat(currentChatRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchChats();
  }, [activeChat, isReload]);

  useEffect(() => {
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [currentChat?.messages]);

  const createNewChat = async () => {
    try {
      const res = await ChatService.createChat("CUSTOM_MODEL");
      const newChat = res.data.data;
      setChats([newChat, ...chats]);
      setActiveChat(newChat._id);
      handleActiveChange(newChat._id);
    } catch (err) {
      console.error(err);
    }
  };

  // Step 1: Verify Token
  // const verifyToken = async () => {
  //   try {
  //     // Fetch available models using token
  //     const res = await axios.get(`${HF_BASE_URL}/models`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     // If models found, save them & mark token as verified
  //     if (res.data?.data?.length > 0) {
  //       setModels(res.data.data.map((m) => m.id)); // extract model IDs
  //       setVerified(true);
  //       alert("✅ Token Verified!");
  //     } else {
  //       alert("❌ No models found with this token.");
  //     }
  //   } catch (err) {
  //     alert("❌ Invalid Token or API Error");
  //   }
  // };

  const verifyToken = async () => {
    try {
      if (!token || token.length === 0) {
        return toastifyTost.error("Please enter a valid token first. ");
      }
      const res = await CustomModelService.getModels(token);
      console.log("models response : ", res.data.data);
      if (res.data?.data?.length > 0) {
        setModels(res.data.data); // extract model IDs
        setVerified(true);
        toastifyTost.success("✅ Token Verified!");
      } else {
        toastifyTost.success("❌ Invalid Token or API Error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectedModel = (modelName) => {
    setSelectedModel(modelName);
    if (currentChat.model !== modelName) {
      createNewChat();
    }
    // if(currentChat.model !== "" && currentChat.model !== selectedModel){

    // }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !currentChat) return;
    if (
      !token ||
      token.length === 0 ||
      !selectedModel ||
      selectedModel.length === 0
    ) {
      return toastifyTost.error(
        "Please paste your token and select a model to chat with."
      );
    }

    try {
      const bodyData = {
        model: selectedModel,
        message: currentMessage,
        token: token,
      };
      console.log("the body data : ", bodyData);
      const res = await CustomModelService.addMessage(
        currentChat._id,
        bodyData
      );
      const { userMessage, aiMessage } = res.data;
      // fetchChats();
      setIsReload(!isReload);

      setCurrentChat((prevChat: Chat) => ({
        ...prevChat,
        messages: [...prevChat.messages, userMessage, aiMessage],
        updatedAt: new Date(),
      }));

      setCurrentMessage("");
    } catch (err: any) {
      // toast({
      //   title: "Error",
      //   description: err?.response?.data?.message || "Failed to send message",
      // });
      console.error(err);
    }
  };

  const handleActiveChange = async (id) => {
    setCurrentChatLoading(true);
    setActiveChat(id);
    const currentChatRes = await ChatService.getChatById(id);
    setCurrentChat(currentChatRes.data.data);
    setCurrentChatLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    navigate("/login");
  };

  const deleteChat = async (id: string) => {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this chat?"
      );
      if (!isConfirmed) return;

      await ChatService.deleteChat(id);
      const updatedChats = chats.filter((chat) => chat._id !== id);
      setChats(updatedChats);
      if (activeChat === id) {
        if (updatedChats.length > 0) {
          setActiveChat(updatedChats[0]._id);
          const currentChatRes = await ChatService.getChatById(
            updatedChats[0]._id
          );
          setCurrentChat(currentChatRes.data.data);
        } else {
          setActiveChat(null);
          setCurrentChat({});
        }
      }
      toast({
        title: "Chat Deleted",
        description: "The chat has been deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRenameChat = (chatId: string, currentTitle: string) => {
    setRenameChatId(chatId);
    setRenameInput(currentTitle); // prefill with current chat title
    setIsRenameDialogOpen(true);
  };

  // -----------------------------
  // UI Layout
  // -----------------------------
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden border-r border-border bg-sidebar-bg`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <Button
              onClick={() => setSidebarOpen(false)}
              size="sm"
              variant="ghost"
              className="md:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <hr className="mb-2" />
          {/* Token Input */}
          <div className="border rounded-sm p-2">
            <h6 className="text-base font-bold dark:text-white">
              Verify token{" "}
            </h6>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter HF Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{ width: "100%", marginBottom: "0.5rem" }}
              />
              <Button onClick={verifyToken}>Verify Token</Button>
            </div>
            {/* Model Selection */}
            {verified && (
              <>
                <h6 className="text-base font-bold dark:text-white">Models</h6>
                <select
                  value={selectedModel}
                  onChange={(e) => handleSelectedModel(e.target.value)}
                  // style={{ width: "100%", marginBottom: "1rem" }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value="">-- Select a model --</option>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <hr className="mt-2 mb-2" />

          {/* create new chat button  */}
          {verified && (
            <Button
              onClick={createNewChat}
              className="mb-4 bg-gradient-primary hover:opacity-90 shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          )}

          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="space-y-2">
              {chats.map((chat, idx) => (
                <button
                  key={chat._id}
                  onClick={() => handleActiveChange(chat._id)}
                  className={`w-full p-3 text-left rounded-lg transition-colors ${
                    activeChat === chat._id
                      ? "bg-muted text-foreground"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(chat.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <DropdownMenu key={idx}>
                      <DropdownMenuTrigger asChild>
                        <EllipsisVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuItem
                          onClick={() => handleRenameChat(chat._id, chat.title)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteChat(chat._id)}>
                          <Delete className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mb-4 border-2   border-primary text-primary hover:bg-primary/10"
          >
            {/* <Plus className="w-4 h-4 mr-2" /> */}
            Chat with Admin Specified Model
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!sidebarOpen && (
                <Button
                  onClick={() => setSidebarOpen(true)}
                  size="sm"
                  variant="ghost"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}
              <h1 className="text-xl font-semibold">
                {currentChat?.model || "Custom Model"}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {activeChat && (
                <Button
                  onClick={() => setIsUrlDialogOpen(true)}
                  className="bg-gradient-primary hover:opacity-90 shadow-glow"
                >
                  Share chat
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        U
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        {currentChatLoading ? (
          <ScrollArea className="flex-1 p-4">
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Loading chat...</p>
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-3xl mx-auto space-y-6">
              {Object.keys(currentChat).length > 0 ? (
                currentChat?.messages.map((message, idx) =>
                  message.role === "user" ? (
                    <div
                      key={idx}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-gradient-primary text-primary-foreground shadow-glow"
                            : "bg-message-assistant border border-border"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={idx}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-gradient-primary text-primary-foreground shadow-glow"
                            : "bg-message-assistant border border-border"
                        }`}
                      >
                        <MarkdownDisplay content={message.content} />
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Please select a chat or create a new one to start
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Message Input */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex space-x-3">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 bg-chat-input border-border focus:ring-primary"
              />
              <Button
                onClick={sendMessage}
                disabled={!currentMessage.trim()}
                className="bg-gradient-primary hover:opacity-90 shadow-glow"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                // Call your API to rename chat
                await ChatService.renameChat(renameChatId, renameInput);

                // Update local state
                // setChats((prev) =>
                //   prev.map((chat) =>
                //     chat._id === renameChatId
                //       ? { ...chat, title: renameInput }
                //       : chat
                //   )
                // );
                setIsReload(!isReload);

                setIsRenameDialogOpen(false);
                toast({
                  title: "Chat Renamed",
                  description: "Your chat has been renamed successfully.",
                });
              } catch (err) {
                toast({
                  title: "Error",
                  description: "Failed to rename chat.",
                  variant: "destructive",
                });
                console.error(err);
              }
            }}
          >
            <Input
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              placeholder="New chat name"
              required
              className="mb-4"
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-blue-600 text-white">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Chat</DialogTitle>
            <DialogDescription>
              Copy the URL below to share this chat with others.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Input
              value={shareUrl + activeChat}
              readOnly
              className="bg-gray-100 cursor-pointer text-black"
              onClick={(e) => {
                (e.target as HTMLInputElement).select();
              }}
            />

            <Button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl + activeChat);
                toast({
                  title: "Copied",
                  description: "URL copied to clipboard!",
                });
              }}
              className="bg-blue-600 text-white"
            >
              Copy
            </Button>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
