import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAIResponse, fetchProductRequestAPI } from "../services/api";
import { addMessage, setMessages, setSessionId, setLoading } from "../redux/chatSlice";
import { set } from "zod";

const useChatLogic = () => {
  // Get state from Redux
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.messages);
  const sessionId = useSelector(state => state.chat.sessionId);
  const isLoading = useSelector(state => state.chat.isLoading);
 let hasTechnicalSupport = false;
  // Local state
  const [inputValue, setInputValue] = useState("");
  const [showOptions, setShowOptions] = useState(true);
  const [productInfo, setProductInfo] = useState({ email: "", username: "", productName: "" });
  const [currentStep, setCurrentStep] = useState("initial");
  const messagesEndRef = useRef(null);
  const [isInitial, setIsInitial] = useState(false);
  // Add state to control typing indicator visibility
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTypingIndicator]);

  useEffect(() => {
    // Only initialize welcome message if no messages exist
    if (messages.length === 0) {
      dispatch(addMessage({ text: "Welcome to our support chat! How can I help you today?😊", sender: "ai" }));
    }
  }, [dispatch, messages.length]);

  const handleInputChange = (e) => setInputValue(e.target.value);

  // Function to show typing indicator for a specified duration
  const showLoadingIndicator = async (delayMs = 2000) => {
    setShowTypingIndicator(true);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    setShowTypingIndicator(false);
  };

  // const handleOptionSelect = (option) => {
  //   const userMessage = { text: option === "product" ? "Request for new product" : "Technical support", sender: "user" };
  //   dispatch(addMessage(userMessage));
  //   console.log("option product ")
  //   setShowOptions(false);

  //   if (option === "product") {
  //     // Ask for email first
  //     setCurrentStep("emailInput");
  //     dispatch(addMessage({ 
  //       text: "Great! To process your product request ✨, I'll need a few details. First, what's your email address?", 
  //       sender: "ai" 
  //     }));
  //     return;
  //   } else {
  //     dispatch(addMessage({ 
  //       text: "I understand you need technical support. Please describe the issue you're experiencing, and I'll do my best to help.", 
  //       sender: "ai" 
  //     }));
  //   }
  // };
  const isConfirmingSupport = async (response) => {
    
  console.log("isConfirmingSupport use ", isConfirmingSupport)
    
      await showLoadingIndicator(2000);
      const supportResponse = {
        sender: "ai",
        text: "I'll connect you with our technical support team right away.",
        supportInfo: {
          supportTeamInfo: {
            name: "Technical Support Team",
            expertise: "Product specialists",
            availability: "24/7 Support Available"
          },
          contactOptions: [
            {
              method: "Live Chat",
              details: "Available now",
              url: "https://example.com/chat",
              priority: 1
            },
            {
              method: "Phone",
              details: "+1 (800) 555-1234",
              priority: 2
            },
            {
              method: "Email",
              details: "techsupport@example.com",
              priority: 3
            },
            {
              method: "Support Portal",
              details: "https://support.example.com",
              priority: 4
            }
          ],
          ticketInfo: {
            priority: "Medium",
            estimatedResponseTime: "Under 2 hours",
            referenceCode: `TECH-${Date.now().toString().slice(-6)}`
          },
          message: "Our technical support team is ready to assist you with your question."
        }
      };

      dispatch(addMessage(supportResponse));
      dispatch(setLoading(false));
      return;
    };
    const handleProductInfoSubmit = async () => {

      try {
        dispatch(setLoading(true));
        // Show typing indicator while processing submission
        setShowTypingIndicator(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setShowTypingIndicator(false);

        const response = await fetchProductRequestAPI({ ...productInfo, sessionId });
        const ticketId = response.ticketId || `PRD-${Math.floor(Math.random() * 10000)}`;

        // Update sessionId if returned from API
        if (response.sessionId) {
          dispatch(setSessionId(response.sessionId));
        }

        dispatch(addMessage({
          text: `Thank you! Your product request has been submitted. A confirmation email will be sent to ${productInfo.email} shortly. Your ticket reference is: ${ticketId}`,
          sender: "ai",
        }));

        setProductInfo({ email: "", username: "", productName: "" });
        setCurrentStep("initial");
        setShowOptions(true);
      } catch (error) {
        console.error("Error submitting product request:", error);
        dispatch(addMessage({
          text: "Sorry, I encountered an error processing your request. Please try again.",
          sender: "ai",
          isError: true
        }));
      } finally {
        dispatch(setLoading(false));
      }
    };

    const handleSendMessage = async (messageText, isInitial = false) => {
      try {
        if (!messageText.trim()) return;

        // Add user message to state
        const userMessage = { sender: "user", text: messageText };
        dispatch(addMessage(userMessage));

        // Set loading state
        dispatch(setLoading(true));

        // Process input based on current step
        if (currentStep === "emailInput") {
          // Save email and ask for username after delay
          setProductInfo(prev => ({ ...prev, email: messageText }));
          // Show typing indicator for 2 seconds
          await showLoadingIndicator(2000);
          setCurrentStep("usernameInput");
          dispatch(addMessage({
            text: "Thanks! Now, what's your full name?",
            sender: "ai"
          }));
          dispatch(setLoading(false));
          return;
        }
        else if (currentStep === "usernameInput") {
          // Save username and ask for product name after delay
          setProductInfo(prev => ({ ...prev, username: messageText }));
          // Show typing indicator for 2 seconds
          await showLoadingIndicator(2000);
          setCurrentStep("productInput");
          dispatch(addMessage({
            text: "Great! Finally, what product are you interested in?",
            sender: "ai"
          }));
          dispatch(setLoading(false));
          return;
        }
        else if (currentStep === "productInput") {
          // Save product name and submit the form
          setProductInfo(prev => ({ ...prev, productName: messageText }));
          dispatch(setLoading(false));
          // Show typing indicator while processing submission
          await showLoadingIndicator(2000);
          handleProductInfoSubmit();
          return;
        }

     
        const requestData = {
          query: messageText,
          sessionId: sessionId
        };

     
        setShowTypingIndicator(true);

        // Send the request to the backend
        const response = await fetchAIResponse(requestData);
        setShowTypingIndicator(false);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        

        // Process the response based on its type
        let aiMessage = { sender: "ai", text: data.answer || "Sorry, I couldn't process that." };

        // Handle different response types
        if (data.type === "TECHNICAL") {
          aiMessage.text = data.answer;
          console.log("TECHNICAL_WITH_DOCS")
        } else if (data.type === "TECHNICAL_WITHOUT_DOCS") {
          // For technical support, include the support information
          aiMessage.text = data.answer;
        } else if (data.type === "PRODUCT_REQUEST") {
          // Handle product request
          setCurrentStep("emailInput");
          aiMessage.text = "Great! I'll need your email to send you information about this product.";
        } else if (data.type === "EMAIL_CONFIRMATION") {
          // Handle email confirmation
          setCurrentStep("complete");
          aiMessage.text = `Thank you! We'll send information about "${data.productName}" to ${data.email} shortly.`;
        } else if (data.type === "IRRELEVANT") {
          // Handle irrelevant queries
          aiMessage.text = data.message;
          if (data.suggestion) {
            aiMessage.text += ` ${data.suggestion}`;
          }
        }
        if (data?.techSupport === true) {
          hasTechnicalSupport = true;
          isConfirmingSupport(data);
          console.log("isConfirmingSupport ai use ", hasTechnicalSupport)
          return;
        }
        // Add AI message to state
        dispatch(addMessage(aiMessage));

        // Update session ID if it's a new conversation
        if (data.sessionId && !sessionId) {
          dispatch(setSessionId(data.sessionId));
        }

   

      } catch (error) {
        console.error("Error sending message:", error);
        dispatch(addMessage({
          sender: "ai",
          text: "I'm sorry, I encountered an error processing your request. Please try again later. contact our technical team ",
          isError: true
        }));
      } finally {
        dispatch(setLoading(false));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!inputValue.trim()) return;

      await handleSendMessage(inputValue, isInitial);
      setInputValue("");
    };
    

    return {

      messages,
      inputValue,
      isLoading,
      showOptions,
      currentStep,
      messagesEndRef,
      hasTechnicalSupport,
      sessionId,
      showTypingIndicator,  // Return this state for the ChatMessages component
      handleInputChange,
    
      handleSubmit,
    };
  };

  export default useChatLogic;