import { addDoc, collection, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";

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
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// System prompt for the chatbot - enhanced to provide more helpful responses
const RECOVERY_COMPANION_PROMPT = `
You are Recovery Companion, a supportive AI assistant in an eating disorder recovery app. Your primary goal is to provide meaningful, practical support for users recovering from eating disorders.

Please provide responses that are:
1. Specific and actionable - offer concrete strategies, not just general encouragement
2. Recovery-oriented and hopeful - focus on progress over perfection
3. Empathetic but professional - validate feelings without reinforcing disordered thoughts
4. Free of specific mentions of weights, calories, or BMI numbers
5. Never prescriptive about specific foods, diet plans, or exercise regimens
6. Focused on emotional well-being and healthy coping mechanisms

When responding to users:
- If they express difficulty with eating: Suggest small, manageable steps like eating one regular meal, having a snack, or reaching out to their support person.
- If they express negative body image: Redirect focus to body functionality and self-compassion exercises.
- If they mention relapse or setbacks: Normalize these as part of recovery and encourage them to be gentle with themselves.
- If they're having a good day: Celebrate this specifically and help them identify what worked well.
- If they mention meal plans or treatment: Encourage adherence to professional advice while validating their challenges.

Always respond in a warm, personable tone. Provide 2-4 sentences that are specific to eating disorder recovery context.

If the user mentions crisis or self-harm, always include: "Please contact the Crisis Text Line (text HOME to 741741) for immediate support."
`;

// Fallback responses when API is not available - enhanced to be more specific and helpful
const FALLBACK_RESPONSES = [
  "Recovery involves rebuilding your relationship with food and your body. Try focusing on one small act of self-care today that isn't related to appearance.",
  "Eating regularly throughout the day is an important part of recovery, even when it feels difficult. What's one small nutrition goal you could work on today?",
  "Recovery isn't just about food—it's about reclaiming your life from ED thoughts. What activities or interests did you enjoy before your eating disorder became prominent?",
  "Body image healing takes time and practice. Try to notice one thing your body helped you do today, rather than focusing on how it looks.",
  "Challenging eating disorder thoughts is a crucial skill in recovery. When you notice a negative thought, try asking 'Is this my eating disorder speaking?'",
  "Setbacks in recovery are normal and don't erase your progress. What helped you move forward after difficult moments in the past?",
  "Self-compassion is essential in recovery. How would you respond to a friend going through what you're experiencing right now?",
  "Recovery requires building a life beyond the eating disorder. What values or relationships would you like to prioritize as you heal?",
  "Meal support can be helpful during challenging eating times. Is there someone supportive you could eat with or call before/after meals?",
  "Recovery means honoring your body's needs for both nourishment and rest. What's one way you could listen to what your body needs today?"
];

// Function to check if we can connect to the API
const checkApiConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('API connectivity check failed:', error);
    return false;
  }
};

// Get a random fallback response
const getFallbackResponse = (userMessage: string): string => {
  // Check for crisis-related keywords to provide appropriate response
  const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'harm myself', 'self harm', 'die'];
  
  if (crisisKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
    return "I'm concerned about what you're sharing. Please contact the Crisis Text Line (text HOME to 741741) for immediate support. They have trained counselors available 24/7 to help you through this difficult time.";
  }
  
  // Return a random supportive message
  const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[randomIndex];
};

// Function to get a response using Gemini API using direct fetch calls
export const getChatGPTResponse = async (userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> => {
  // Add retry mechanism for API calls
  const maxRetries = 3;
  let retryCount = 0;

  // Check network connectivity first
  if (!navigator.onLine) {
    console.log("Network is offline");
    return getFallbackResponse(userMessage) + " (You appear to be offline. Messages will be available when your connection is restored.)";
  }

  // Check API connectivity
  const isApiAvailable = await checkApiConnectivity();
  if (!isApiAvailable) {
    console.log("API is unreachable");
    return getFallbackResponse(userMessage) + " (I'm having trouble connecting to my services right now. Please try again in a moment.)";
  }

  while (retryCount < maxRetries) {
    try {
      console.log("Preparing to call Gemini API with direct fetch...");
      
      // Create context from conversation history
      let contextMessage = "";
      if (conversationHistory.length > 0) {
        const lastMessage = conversationHistory[conversationHistory.length - 1];
        if (lastMessage.sender === "ai") {
          contextMessage = `\nYour last response was: "${lastMessage.content}"`;
        }
      }
      
      // Create the prompt
      const promptText = `
${RECOVERY_COMPANION_PROMPT}

${contextMessage}

User message: "${userMessage}"

Your brief response (1-3 sentences):`;

      // Prepare request body
      const requestBody = {
        contents: [
          {
            parts: [
              { text: promptText }
            ]
          }
        ],
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200
        }
      };
      
      console.log("Calling Gemini API with direct fetch...");
      
      // Set up abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Make the API call
      const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`API Error: ${response.status} ${response.statusText}`, errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      console.log("Received API response:", data);
      
      // Extract the text from the response
      if (data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts[0] && 
          data.candidates[0].content.parts[0].text) {
        
        const responseText = data.candidates[0].content.parts[0].text.trim();
        console.log("Extracted text from response:", responseText);
        
        if (!responseText) {
          throw new Error("Empty response from API");
        }
        
        return responseText;
      } else {
        console.error("Unexpected API response structure:", data);
        throw new Error("Unexpected API response structure");
      }
      
    } catch (error) {
      console.error(`Error getting AI response (attempt ${retryCount + 1}/${maxRetries}):`, error);
      
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`Retrying... (${retryCount}/${maxRetries})`);
        // Wait for a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // If all retries fail, use fallback response
      if (error.message === "Failed to fetch" || 
          error.message.includes("NetworkError") || 
          error.message.includes("network") ||
          error.message.includes("timed out") ||
          error.message.includes("abort")) {
        return getFallbackResponse(userMessage) + " (I'm having trouble connecting to my services right now. Please try again in a moment.)";
      }
      
      // Preserve the original error for debugging instead of creating a generic message
      throw error;
    }
  }
  
  // This should never be reached due to the retry logic, but TypeScript needs it
  return getFallbackResponse(userMessage);
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