import { apiClient } from "@/api/AxiosServiceApi";
import { initChat } from "@/components/realtimechat/ably";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, MoreVertical, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import InlineLoader from "./InlineLoader";

function timeAgoFromOffset(offsetDateTime) {
  const start = new Date(offsetDateTime);
  const now = new Date();
  const diffMs = now - start;
  if (diffMs < 0) return "just now";
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

const PAGE_SIZE = 5;

export default function ChatArea({
  selectedConversation,
  mobileView,
  setMobileView,
}) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [ablyChannel, setAblyChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchPreviousMessages = async (nextPage = 0) => {
    if (!selectedConversation || !hasMore || isFetchingMore) return;
    try {
      setIsFetchingMore(true);
      const response = await apiClient.get(
        `/api/chat/history/${userId}/${selectedConversation.opponent.id}?page=${nextPage}&size=${PAGE_SIZE}`,
      );
      const { data } = response;

      if (!Array.isArray(data) || data.length === 0) {
        setHasMore(false);
        return;
      }

      const container = containerRef.current;
      const oldScrollHeight = container?.scrollHeight;

      setMessages((prev) => [...data, ...prev]);

      requestAnimationFrame(() => {
        if (container && oldScrollHeight) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - oldScrollHeight;
        }
      });

      setPage(nextPage);
    } catch (err) {
      console.error("Error fetching previous messages:", err);
    } finally {
      setIsFetchingMore(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedConversation) return;
    setLoading(true);
    setMessages([]);
    setPage(0);
    setHasMore(true);

    let channel;

    (async () => {
      try {
        channel = await initChat(
          selectedConversation.opponent.id,
          (msg) => setMessages((prev) => [...prev, msg]),
          userId,
        );
        setAblyChannel(channel);
        await fetchPreviousMessages(0);
      } catch (err) {
        console.error("Chat init failed:", err);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (channel) channel.unsubscribe("message");
    };
  }, [selectedConversation, userId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!hasMore || isFetchingMore) return;
      if (container.scrollTop < 500) {
        fetchPreviousMessages(page + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, isFetchingMore, selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ablyChannel || !selectedConversation) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const messageData = {
      senderId: userId,
      receiverId: selectedConversation.opponent.id,
      content: newMessage,
    };

    try {
      await apiClient.post(
        "/api/chat/send",
        { channelName: ablyChannel.name, ...messageData },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNewMessage("");
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  const lastMessageTimestamp =
    selectedConversation?.chats?.timestamp ?? new Date();

  return (
    <Card
      className={`flex flex-col h-[85vh] sm:h-full overflow-auto relative ${
        mobileView === "list" ? "hidden" : "flex"
      } lg:flex lg:col-span-3 ${
        selectedConversation ? "" : "opacity-50 pointer-events-none"
      }`}
    >
      {/* Header */}
      <CardHeader className="sticky top-0 z-[2] bg-background flex flex-row items-center justify-between gap-2 border-b p-4">
        <div className="flex gap-1 items-center">
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setMobileView("list")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {selectedConversation ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`data:image/png;base64,${selectedConversation.opponent.imageData}`}
                />
                <AvatarFallback>
                  {selectedConversation.opponent.username[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {selectedConversation.opponent.username}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {timeAgoFromOffset(lastMessageTimestamp)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">
              Select a conversation to start chat
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="bg-transparent">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={5}>
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Internship Information</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">
              Delete Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Messages */}
      <CardContent className="relative flex-1 p-0">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-md">
            <InlineLoader />
          </div>
        )}

        <div className="flex flex-col h-full">
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col"
          >
            {isFetchingMore && (
              <div className="text-center text-xs text-muted-foreground">
                Loading older messages...
              </div>
            )}

            {!isFetchingMore && (
              <div className="p-3 text-center">
                <Button
                  variant="ghost"
                  onClick={() => fetchPreviousMessages(page + 1)}
                >
                  Load more
                </Button>
              </div>
            )}

            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.senderId === userId ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex flex-col max-w-[70%]">
                  <div
                    className={`${
                      message.senderId === userId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    } rounded-lg px-3 py-[6px]`}
                  >
                    <span>{message.content}</span>
                  </div>
                  <div
                    className={`text-[10px] mt-1 ${
                      message.senderId === userId ? "text-right" : "text-left"
                    }`}
                  >
                    {timeAgoFromOffset(message.timestamp ?? new Date())}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`border-t p-4 sticky bottom-0 bg-background ${
              loading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center space-x-2">
              {/* <Button size="icon" variant="outline" className="bg-transparent">
                <Paperclip className="h-4 w-4" />
              </Button> */}
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="resize-none flex-1 min-h-[20px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={
                  !newMessage.trim() || !ablyChannel || !selectedConversation
                }
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
