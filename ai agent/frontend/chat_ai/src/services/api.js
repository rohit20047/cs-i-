// Store session ID in localStorage
let sessionId = localStorage.getItem('chatSessionId');

export const fetchAIResponse = async (messageOrRequestData) => {
    try {
      // Determine if we're receiving a string or an object
      let requestData;
      
      if (typeof messageOrRequestData === 'string') {
        // Legacy format - just a message string
        requestData = {
          query: messageOrRequestData,
          sessionId: localStorage.getItem('chatSessionId')
        };
      } else {
        // New format - request object
        requestData = messageOrRequestData;
      }
      
      const response = await fetch("http://localhost:3001/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
      
      // Store the session ID for future requests
      if (requestData.sessionId) {
        localStorage.setItem('chatSessionId', requestData.sessionId);
      }
      
      return response;
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  };
  
  export const fetchProductRequestAPI = async (productInfo, customSessionId = null) => {
    try {
      // Use provided sessionId if available, otherwise use the stored one
      const currentSessionId = customSessionId || sessionId;
      
      const response = await fetch("http://localhost:3001/api/product-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productInfo,
          sessionId: currentSessionId
        }),
      });
      if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
      const data = await response.json();
      
      // Store the session ID for future requests
      if (data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem('chatSessionId', sessionId);
      }
      
      return data;
    } catch (error) {
      console.error("Product request API call failed:", error);
      return { ticketId: `PRD-${Math.floor(Math.random() * 10000)}` };
    }
  };