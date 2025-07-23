import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile
} from "lucide-react";

const conversations = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior SDE at Google",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Great session today! Keep practicing...",
    timestamp: "2m ago",
    unread: 2,
    online: true
  },
  {
    id: 2,
    name: "Raj Patel",
    role: "PM at Microsoft",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Let's schedule our next session",
    timestamp: "1h ago",
    unread: 0,
    online: false
  },
  {
    id: 3,
    name: "Mike Johnson",
    role: "Tech Lead at Amazon",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Your resume looks much better now",
    timestamp: "3h ago",
    unread: 1,
    online: true
  }
];

const currentMessages = [
  {
    id: 1,
    sender: "Sarah Chen",
    message: "Hi Alex! How did the technical interview go?",
    timestamp: "10:30 AM",
    isMe: false
  },
  {
    id: 2,
    sender: "Me",
    message: "It went really well! I was able to solve both coding problems, thanks to our practice sessions.",
    timestamp: "10:32 AM",
    isMe: true
  },
  {
    id: 3,
    sender: "Sarah Chen",
    message: "That's fantastic! I knew you had it in you. What was the feedback like?",
    timestamp: "10:33 AM",
    isMe: false
  },
  {
    id: 4,
    sender: "Me",
    message: "They said my approach was solid and my code was clean. They want to move forward with the next round!",
    timestamp: "10:35 AM",
    isMe: true
  },
  {
    id: 5,
    sender: "Sarah Chen",
    message: "Excellent! Let's schedule a session to prepare for the system design round. I'll share some resources too.",
    timestamp: "10:36 AM",
    isMe: false
  }
];

export default function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage("");
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-2 p-4">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedChat(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChat.id === conversation.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                          </Avatar>
                          {conversation.online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold truncate">{conversation.name}</h4>
                            <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{conversation.role}</p>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        {conversation.unread > 0 && (
                          <Badge variant="default" className="h-5 w-5 text-xs p-0 flex items-center justify-center">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2 flex flex-col">
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback>{selectedChat.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedChat.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedChat.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[calc(100vh-24rem)] p-4">
                <div className="space-y-4">
                  {currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}