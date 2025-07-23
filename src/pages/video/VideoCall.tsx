import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  ScreenShare,
  MessageCircle,
  Settings,
  Users,
  Grid3X3,
  Maximize
} from "lucide-react";

export default function VideoCall() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState("05:23");

  const participants = [
    {
      id: 1,
      name: "You",
      avatar: "/api/placeholder/40/40",
      isMuted: isMuted,
      isVideoOff: isVideoOff
    },
    {
      id: 2,
      name: "Sarah Chen",
      avatar: "/api/placeholder/40/40",
      isMuted: false,
      isVideoOff: false
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Mock Interview Session</h1>
            <Badge variant="secondary">Live • {callDuration}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              Connected
            </Badge>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {participants.map((participant) => (
            <Card key={participant.id} className="relative overflow-hidden bg-muted/50">
              <CardContent className="p-0 h-full min-h-[300px] flex items-center justify-center">
                {participant.isVideoOff ? (
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback className="text-2xl">{participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-lg font-medium">{participant.name}</p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="h-24 w-24 mx-auto mb-4">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-2xl">{participant.name[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-lg font-medium">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">Video Preview</p>
                    </div>
                  </div>
                )}
                
                {/* Participant Controls Overlay */}
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {participant.name}
                  </Badge>
                  {participant.isMuted && (
                    <Badge variant="destructive" className="h-6 w-6 p-0 flex items-center justify-center">
                      <MicOff className="h-3 w-3" />
                    </Badge>
                  )}
                </div>

                {/* Video Controls for Self */}
                {participant.name === "You" && (
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-background border-t p-6">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="lg"
            onClick={() => setIsMuted(!isMuted)}
            className="h-12 w-12 rounded-full p-0"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoOff ? "destructive" : "outline"}
            size="lg"
            onClick={() => setIsVideoOff(!isVideoOff)}
            className="h-12 w-12 rounded-full p-0"
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className="h-12 px-6"
          >
            <ScreenShare className="h-5 w-5 mr-2" />
            {isScreenSharing ? "Stop Sharing" : "Share Screen"}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className="h-12 w-12 rounded-full p-0"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-full p-0"
          >
            <Users className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-full p-0"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <div className="w-px h-8 bg-border mx-2"></div>

          <Button
            variant="destructive"
            size="lg"
            className="h-12 px-6 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            End Call
          </Button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-lg z-50 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Session Chat</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
              >
                ×
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-3">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">Sarah: Ready to start the technical interview?</p>
                <p className="text-xs text-muted-foreground mt-1">5 minutes ago</p>
              </div>
              <div className="bg-primary text-primary-foreground p-3 rounded-lg ml-8">
                <p className="text-sm">Yes, I'm ready!</p>
                <p className="text-xs text-primary-foreground/70 mt-1">4 minutes ago</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <Button size="sm" className="bg-gradient-primary">
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}