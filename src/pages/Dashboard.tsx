import { act, useEffect, useState } from "react";
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { id } = useParams();

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
  const [isShare, setIsShare] = useState(id && id.length === 24 ? true : false);
  const [actionLoading, setActionLoading] = useState(false);
  //

  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(
    "http://localhost:8080/dashboard/share/"
  );

  //
  const [isOn, setIsOn] = useState(false);
  const handleToggle = () => {
    setIsOn(!isOn);
  };
  // const currentChat = chats.find((chat) => chat._id === activeChat) || chats[0];

  const getSharedChat = async (id: any) => {
    setCurrentChatLoading(true);
    setActiveChat(id);
    const currentChatRes = await ChatService.getChatById(id);
    setCurrentChat(currentChatRes.data.data);
    setCurrentChatLoading(false);
  };

  // Fetch all chats on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        console.log("Fetching chats...");
        const res = await ChatService.getChats("ADMIN_SPECIFIED_MODEL");
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

    if (id && id.length === 24) {
      getSharedChat(id);
    } else {
      fetchChats();
    }
  }, [activeChat, isReload]);

  // Create new chat
  const createNewChat = async () => {
    try {
      const res = await ChatService.createChat("ADMIN_SPECIFIED_MODEL");
      const newChat = res.data.data;
      setChats([newChat, ...chats]);
      setActiveChat(newChat._id);
      handleActiveChange(newChat._id);
      fetch;
    } catch (err) {
      console.error(err);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!currentMessage.trim() || !currentChat) return;
    console.log("Sending message:", currentMessage);
    try {
      setActionLoading(true);
      const res = await ChatService.addMessage(
        currentChat._id,
        currentMessage,
        isOn
      );
      const { userMessage, aiMessage } = res.data;
      console.log("Received response of add message in dashboard :", res.data);

      setCurrentChat((prevChat: Chat) => ({
        ...prevChat,
        messages: [...prevChat.messages, userMessage, aiMessage],
        updatedAt: new Date(),
      }));

      setCurrentMessage("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to send message",
      });
      console.error(err);
    } finally {
      setActionLoading(false);
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

  const navigateToCustomModel = () => {
    navigate("/dashboard/custom-model");
  };

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

          <Button
            onClick={createNewChat}
            className="mb-4 bg-gradient-primary hover:opacity-90 shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          <ScrollArea className="flex-1">
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
            onClick={navigateToCustomModel}
            className="mb-4 border-2   border-primary text-primary hover:bg-primary/10"
          >
            {/* <Plus className="w-4 h-4 mr-2" /> */}
            Chat with Custom Model
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
                {currentChat?.model || "Admin Specified Model"}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {activeChat && !isShare && (
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
        {id && id.length === 24 ? (
          <div className="border-t border-border bg-card p-4"></div>
        ) : (
          <div className="">
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
                    disabled={!currentMessage.trim() || actionLoading}
                    className="bg-gradient-primary hover:opacity-90 shadow-glow"
                  >
                    {actionLoading ? (
                      <svg
                        className="w-4 h-4 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"
                        ></path>
                      </svg>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="max-w-3xl mx-auto mt-2">
                <div className="w-[200px] flex items-center ps-3 pe-4 border w- [200px] rounded-md">
                  <button
                    onClick={handleToggle}
                    className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                      isOn ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
                        isOn ? "translate-x-6" : "translate-x-0"
                      }`}
                    ></div>
                  </button>
                  <label
                    htmlFor="radio-1"
                    className="w-full py-2 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer"
                  >
                    Search in Database
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
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
};

export default Dashboard;

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   Plus,
//   Send,
//   MessageSquare,
//   User,
//   Settings,
//   LogOut,
//   Menu,
//   X,
// } from "lucide-react";
// import { toast } from "@/hooks/use-toast";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/hooks/useAuth";

// interface Message {
//   id: string;
//   role: "user" | "assistant";
//   content: string;
//   timestamp: Date;
// }

// interface Chat {
//   id: string;
//   title: string;
//   messages: Message[];
//   updatedAt: Date;
// }

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const { logout } = useAuth();
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [currentMessage, setCurrentMessage] = useState("");
//   const [activeChat, setActiveChat] = useState<string | null>(null);
//   const [chats, setChats] = useState<Chat[]>([
//     {
//       id: "1",
//       title: "Getting Started",
//       messages: [
//         {
//           id: "1",
//           role: "assistant",
//           content: "Hello! How can I help you today?",
//           timestamp: new Date(),
//         },
//       ],
//       updatedAt: new Date(),
//     },
//   ]);

//   const currentChat = chats.find((chat) => chat.id === activeChat) || chats[0];

//   const createNewChat = () => {
//     const newChat: Chat = {
//       id: Date.now().toString(),
//       title: "New Chat",
//       messages: [
//         {
//           id: Date.now().toString(),
//           role: "assistant",
//           content: "Hello! How can I help you today?",
//           timestamp: new Date(),
//         },
//       ],
//       updatedAt: new Date(),
//     };
//     setChats([newChat, ...chats]);
//     setActiveChat(newChat.id);
//   };

//   const sendMessage = () => {
//     if (!currentMessage.trim() || !currentChat) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: "user",
//       content: currentMessage,
//       timestamp: new Date(),
//     };

//     const assistantMessage: Message = {
//       id: (Date.now() + 1).toString(),
//       role: "assistant",
//       content:
//         "I'm a demo assistant. In a real app, this would connect to an AI service.",
//       timestamp: new Date(),
//     };

//     const updatedChats = chats.map((chat) => {
//       if (chat.id === currentChat.id) {
//         const newTitle =
//           chat.messages.length === 1
//             ? currentMessage.slice(0, 30) + "..."
//             : chat.title;
//         return {
//           ...chat,
//           title: newTitle,
//           messages: [...chat.messages, userMessage, assistantMessage],
//           updatedAt: new Date(),
//         };
//       }
//       return chat;
//     });

//     setChats(updatedChats);
//     setCurrentMessage("");
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const handleLogout = async () => {
//     await logout();
//     toast({
//       title: "Logged Out",
//       description: "You have been logged out successfully.",
//     });
//     navigate("/login");
//   };

//   return (
//     <div className="flex h-screen bg-background">
//       {/* Sidebar */}
//       <div
//         className={`${
//           sidebarOpen ? "w-80" : "w-0"
//         } transition-all duration-300 overflow-hidden border-r border-border bg-sidebar-bg`}
//       >
//         <div className="flex flex-col h-full p-4">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg font-semibold">Chat History</h2>
//             <Button
//               onClick={() => setSidebarOpen(false)}
//               size="sm"
//               variant="ghost"
//               className="md:hidden"
//             >
//               <X className="w-4 h-4" />
//             </Button>
//           </div>

//           <Button
//             onClick={createNewChat}
//             className="mb-4 bg-gradient-primary hover:opacity-90 shadow-glow"
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             New Chat
//           </Button>

//           <ScrollArea className="flex-1">
//             <div className="space-y-2">
//               {chats.map((chat) => (
//                 <button
//                   key={chat.id}
//                   onClick={() => setActiveChat(chat.id)}
//                   className={`w-full p-3 text-left rounded-lg transition-colors ${
//                     activeChat === chat.id ||
//                     (activeChat === null && chat.id === chats[0]?.id)
//                       ? "bg-muted text-foreground"
//                       : "hover:bg-muted/50 text-muted-foreground"
//                   }`}
//                 >
//                   <div className="flex items-start space-x-3">
//                     <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium truncate">
//                         {chat.title}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {chat.updatedAt.toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </ScrollArea>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <header className="border-b border-border bg-card p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               {!sidebarOpen && (
//                 <Button
//                   onClick={() => setSidebarOpen(true)}
//                   size="sm"
//                   variant="ghost"
//                 >
//                   <Menu className="w-4 h-4" />
//                 </Button>
//               )}
//               <h1 className="text-xl font-semibold">Chat Assistant</h1>
//             </div>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="relative h-9 w-9 rounded-full"
//                 >
//                   <Avatar className="h-9 w-9">
//                     <AvatarFallback className="bg-gradient-primary text-primary-foreground">
//                       U
//                     </AvatarFallback>
//                   </Avatar>
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-56" align="end">
//                 <DropdownMenuItem onClick={() => navigate("/profile")}>
//                   <User className="mr-2 h-4 w-4" />
//                   Profile
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => navigate("/settings")}>
//                   <Settings className="mr-2 h-4 w-4" />
//                   Settings
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={handleLogout}>
//                   <LogOut className="mr-2 h-4 w-4" />
//                   Log out
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </header>

//         {/* Messages Area */}
//         <ScrollArea className="flex-1 p-4">
//           <div className="max-w-3xl mx-auto space-y-6">
//             {currentChat?.messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${
//                   message.role === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-[80%] rounded-lg p-4 ${
//                     message.role === "user"
//                       ? "bg-gradient-primary text-primary-foreground shadow-glow"
//                       : "bg-message-assistant border border-border"
//                   }`}
//                 >
//                   <p className="text-sm leading-relaxed">{message.content}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </ScrollArea>

//         {/* Message Input */}
//         <div className="border-t border-border bg-card p-4">
//           <div className="max-w-3xl mx-auto">
//             <div className="flex space-x-3">
//               <Input
//                 value={currentMessage}
//                 onChange={(e) => setCurrentMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Type your message..."
//                 className="flex-1 bg-chat-input border-border focus:ring-primary"
//               />
//               <Button
//                 onClick={sendMessage}
//                 disabled={!currentMessage.trim()}
//                 className="bg-gradient-primary hover:opacity-90 shadow-glow"
//               >
//                 <Send className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
