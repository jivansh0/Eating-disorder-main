import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  MoveDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, getChatGPTResponse, saveChatMessage, getUserChatHistory } from "@/services/chatService";

const AIChatPage = () => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-message",
      sender: "ai",
      content: `Hi ${currentUser?.name || "there"}! I'm your Recovery Companion, here to support you on your journey. How are you feeling today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Load chat history when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      if (currentUser?.uid) {
        try {
          setIsLoading(true);
          const history = await getUserChatHistory(currentUser.uid);
          
          if (history.length > 0) {
            setMessages(history);
          }
        } catch (error) {
          console.error("Error loading chat history:", error);
          toast({
            title: "Error",
            description: "Failed to load chat history. Please try refreshing the page.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadChatHistory();
  }, [currentUser, toast]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if should show scroll button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const bottomThreshold = 100;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > bottomThreshold);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Save user message to database if user is logged in
      if (currentUser?.uid) {
        await saveChatMessage(currentUser.uid, userMessage);
      }
      
      // Get all previous messages for context
      const conversationHistory = [...messages];
      
      // Get AI response from ChatGPT API
      const responseText = await getChatGPTResponse(userMessage.content, conversationHistory);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI response to database if user is logged in
      if (currentUser?.uid) {
        await saveChatMessage(currentUser.uid, aiMessage);
      }
      
      setIsTyping(false);
    } catch (error) {
      console.error("Error in chat:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      
      setIsTyping(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]">
        <div className="mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-healing-900">AI Support Chat</h2>
          <p className="text-muted-foreground">
            Chat with your Recovery Companion for support, guidance, and encouragement
          </p>
        </div>

        <Card className="flex-1 flex flex-col border-healing-200 overflow-hidden">
          <CardHeader className="bg-healing-50 border-b border-healing-100 px-4 py-3">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2 bg-healing-100">
                <AvatarImage src="/bot-avatar.png" />
                <AvatarFallback className="bg-healing-200 text-healing-700">
                  <Bot size={16} />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">Recovery Companion</CardTitle>
                <CardDescription className="text-xs">Your supportive AI assistant</CardDescription>
              </div>
            </div>
          </CardHeader>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse text-healing-500">Loading conversation...</div>
            </div>
          ) : (
            <CardContent 
              className="flex-1 overflow-y-auto p-4 space-y-4" 
              onScroll={handleScroll}
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`flex items-start gap-2 max-w-[80%] ${
                      msg.sender === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className={`h-8 w-8 mt-0.5 ${
                      msg.sender === "ai" ? "bg-healing-100" : "bg-accent"
                    }`}>
                      {msg.sender === "ai" ? (
                        <>
                          <AvatarImage src="/bot-avatar.png" />
                          <AvatarFallback className="bg-healing-200 text-healing-700">
                            <Bot size={16} />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={currentUser?.photoURL || ""} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            <User size={16} />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    
                    <div 
                      className={`rounded-lg px-4 py-2 ${
                        msg.sender === "user" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                    >
                      <div className="text-sm break-words whitespace-pre-wrap">{msg.content}</div>
                      <div className="text-[10px] opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8 mt-0.5 bg-healing-100">
                      <AvatarImage src="/bot-avatar.png" />
                      <AvatarFallback className="bg-healing-200 text-healing-700">
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-healing-400 animate-bounce" />
                        <div className="h-2 w-2 rounded-full bg-healing-400 animate-bounce [animation-delay:0.2s]" />
                        <div className="h-2 w-2 rounded-full bg-healing-400 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>
          )}

          <CardFooter className="p-3 border-t border-healing-100 bg-healing-50">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                disabled={isTyping || isLoading}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!inputMessage.trim() || isTyping || isLoading}
                className="bg-healing-500 hover:bg-healing-600"
              >
                <Send size={18} />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardFooter>

          {showScrollButton && (
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-20 right-6 rounded-full h-10 w-10 bg-primary text-primary-foreground opacity-80 hover:opacity-100 shadow-md"
              onClick={scrollToBottom}
            >
              <MoveDown size={18} />
              <span className="sr-only">Scroll to bottom</span>
            </Button>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

export default AIChatPage;
