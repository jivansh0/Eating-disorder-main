import { addDoc, collection, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Define message types
export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: Date;
}

// Define chat session interface
export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  date: Date;
}

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyC4NJz4xAU4LcwjKxbgVtYpE6smTvc1PVY";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// System prompt for the chatbot - adapted for Gemini to keep responses concise
const RECOVERY_COMPANION_PROMPT = `
You are Recovery Companion, a supportive AI assistant in an eating disorder recovery app.

Please provide SHORT responses (1-3 sentences maximum) that are:
1. Supportive and compassionate
2. Recovery-oriented and hopeful
3. Free of specific mentions of weights, calories, or BMI numbers
4. Focused on emotional support rather than medical advice

If the user mentions crisis or self-harm, always include: "Please contact the Crisis Text Line (text HOME to 741741) for immediate support."
`;

// Function to get a response using Gemini API - only use API, no fallbacks
export const getChatGPTResponse = async (userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> => {
  try {
    // Create the model with safety settings
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    console.log("Creating prompt for Gemini API...");
    
    // Create a simple context-based prompt with the last message for context
    let contextMessage = "";
    if (conversationHistory.length > 0) {
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage.sender === "ai") {
        contextMessage = `\nYour last response was: "${lastMessage.content}"`;
      }
    }
    
    // Create a simple prompt that will work reliably
    const prompt = `
${RECOVERY_COMPANION_PROMPT}

${contextMessage}

User message: "${userMessage}"

Your brief response (1-3 sentences):`;
    
    console.log("Calling Gemini API...");
    
    // Generate content with the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Received response from Gemini API");
    
    // Check if the response is empty or just whitespace
    if (!text || text.trim() === "") {
      console.error("Empty response received from Gemini API");
      throw new Error("The AI returned an empty response. Please try again.");
    }
    
    return text.trim();
    
  } catch (error) {
    console.error("Error getting AI response:", error);
    
    // Return a meaningful error message instead of empty string
    // This ensures the user gets feedback rather than a generic error
    let errorMessage = "I'm having trouble connecting at the moment. Please try again in a few seconds.";
    
    // Check for specific API errors
    if (error.toString().includes("quota") || error.toString().includes("limit")) {
      errorMessage = "I've reached my conversation limit for now. Please try again in a minute.";
    } else if (error.toString().includes("blocked")) {
      errorMessage = "I couldn't process that request due to content safety guidelines. Please try phrasing your message differently.";
    }
    
    return errorMessage;
  }
};

// Save chat message to user's account
export const saveChatMessage = async (userId: string, message: ChatMessage): Promise<void> => {
  try {
    await addDoc(collection(db, "chatMessages"), {
      userId,
      sender: message.sender,
      content: message.content,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
};

// Get chat history for a user
export const getUserChatHistory = async (userId: string): Promise<ChatMessage[]> => {
  try {
    const chatQuery = query(
      collection(db, "chatMessages"),
      where("userId", "==", userId),
      orderBy("timestamp", "asc")
    );
    
    const querySnapshot = await getDocs(chatQuery);
    const messages: ChatMessage[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        sender: data.sender,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date()
      });
    });
    
    return messages;
  } catch (error) {
    console.error("Error getting chat history:", error);
    return [];
  }
};