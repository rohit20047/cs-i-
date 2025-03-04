const { model } = require('../config/modelConfig');

const responseService = {

    async presentNewProductRequest(query, context, conversationContext = "") {
        
            return {
                type: "PRODUCT_REQUEST",
                priority: "HIGH",
                responseTime: "Immediate",
                answer: "ask for mail",
                confidence:  0.95,
                sourcesUsed:  1
            };
        
    },

    
    async presentTechnicalAnswer(query, context, conversationContext = "") {
        try {
            const systemPrompt = {
                role: "system",
                content: `You are a professional customer support AI assisting users with their queries. Always greet the user politely and provide clear, helpful responses based on the provided context and previous conversation.  
                If a user starts with a greeting (e.g., 'Hi', 'Hello'), respond professionally, such as 'Hi, how can I assist you today?'.  
                Do **not** respond to queries that are unrelated to the support context. If a user asks something irrelevant (e.g., general trivia, unrelated topics like 'What is FIFA?' or 'How to play a game?'), **politely ignore the query** and do not generate any response.  
                Ensure that your responses are direct, professional, and helpful. Your response must follow the exact JSON structure specified. If you don't know the answer, say something like 'Please contact technical support for assistance.'`
            };
    
            const userPrompt = {
                role: "user",
                content: `Document Context: ${context}\n\nConversation Context: ${conversationContext}\n\nQuestion: ${query}\n\nProvide your response in this EXACT JSON structure (no additional text or formatting):\n{"type":"TECHNICAL","priority":"HIGH","responseTime":"Immediate","answer":"your answer here","confidence":0.95,"sourcesUsed":1}`
            };
    
            const response = await model.invoke([systemPrompt, userPrompt]);
            let parsedResponse;
    
            try {
                parsedResponse = JSON.parse(response.content);
            } catch (parseError) {
                const cleaned = response.content
                    .replace(/```json\s*|\s*```/g, '')
                    .replace(/[\u201C\u201D]/g, '"')
                    .replace(/[\r\n]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                parsedResponse = JSON.parse(cleaned);
            }
    
            if (!parsedResponse.answer) throw new Error("Response missing required fields");
    
            // Second AI check: Does the response tell the user to contact support?
            const validationPrompt = {
                role: "system",
                content: `You are analyzing a response from an AI support assistant.  
                Your task is to determine whether the response is **advising the user to contact technical/billing support**.  
                Respond with ONLY **"YES"** or **"NO"**. No additional text.`  
            };
    
            const validationUserPrompt = {
                role: "user",
                content: `Response: "${parsedResponse.answer}"\n\nDoes this message tell the user to contact technical support?`
            };
    
            const validationResponse = await model.invoke([validationPrompt, validationUserPrompt]);
            const validationResult = validationResponse.content.trim().toUpperCase();
    
            if (validationResult === "YES") {
                return {
                    type: "TECHNICAL",
                    priority: "HIGH",
                    techSupport: true,
                    responseTime: "Immediate",
                    answer: parsedResponse.answer,
                    confidence: 1.0,
                    sourcesUsed: 0
                };
            }
    
            return {
                type: "TECHNICAL",
                priority: "HIGH",
                techSupport: false,
                responseTime: "Immediate",
                answer: parsedResponse.answer,
                confidence: typeof parsedResponse.confidence === 'number' ? parsedResponse.confidence : 0.95,
                sourcesUsed: typeof parsedResponse.sourcesUsed === 'number' ? parsedResponse.sourcesUsed : 1
            };
        } catch (error) {
            console.error("Error handling technical answer response:", error);
            return this.presentTechnicalAnswerNoDocs(query, context, conversationContext);
        }
    },
    

    async presentTechnicalAnswerNoDocs(query, context, conversationContext = "") {
        query = query || "";
        context = context || "";
        conversationContext = conversationContext || "";

        function isQueryRelatedToPastConversation(query, conversationContext) {
            if (!conversationContext.trim()) return false;
            const conversationWords = conversationContext.split(/\s+/);
            return conversationWords.some(word => word && query.includes(word));
        }

        if (!isQueryRelatedToPastConversation(query, conversationContext)) {
            return {
                type: "NON_TECHNICAL",
                message: "Your query appears to be specific in nature. While we have some relevant information, you may want to contact our support team for more personalized assistance.",
                contactInfo: { email: "support@example.com", phone: "1-800-XXX-YYYY", supportHours: "24/7" },
                partialInfo: "Based on our documentation, we can provide some general information, but for specific details, please contact support."
            };
        }

        try {
            const systemPrompt = {
                role: "system",
                content: "You are an advanced technical support AI. You are strictly limited to answering ONLY queries that directly pertain to technical aspects from previous interactions with the user. You must provide your answer exclusively in the exact JSON structure specified. Do not include any non-technical commentary, explanations, or responses unrelated to the prior technical conversation."
            };

            const userPrompt = {
                role: "user",
                content: `Context: ${context}\n\nConversation Context: ${conversationContext}\n\nQuestion: ${query}\n\nProvide your response in this EXACT JSON structure (no additional text or formatting):\n{"type":"TECHNICAL_WITHOUT_DOCS","priority":"HIGH - No Documentation","responseTime":"Immediate","answer":"your answer here","confidence":0.95,"sourcesUsed":0,"relevantDocs":[]}`
            };

            const response = await model.invoke([systemPrompt, userPrompt]);
            if (!response.content) throw new Error("Model response content is undefined");

            let parsedResponse;
            try {
                parsedResponse = JSON.parse(response.content);
            } catch (parseError) {
                const cleaned = response.content
                    .replace(/```json\s*|\s*```/g, '')
                    .replace(/[\u201C\u201D]/g, '"')
                    .replace(/[\r\n]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                parsedResponse = JSON.parse(cleaned);
            }

            if (!parsedResponse.answer) throw new Error("Response missing required fields");

            return {
                type: "TECHNICAL_WITHOUT_DOCS",
                priority: "HIGH - No Documentation",
                techSupport: true,
                responseTime: "Immediate",
                answer: parsedResponse.answer,
                confidence: typeof parsedResponse.confidence === 'number' ? parsedResponse.confidence : 0.95,
                sourcesUsed: typeof parsedResponse.sourcesUsed === 'number' ? parsedResponse.sourcesUsed : 0,
                relevantDocs: Array.isArray(parsedResponse.relevantDocs) ? parsedResponse.relevantDocs : []
            };
        } catch (error) {
            console.error("Error handling technical no docs response:", error);
            return {
                type: "NON_TECHNICAL",
                message: "Your query appears to be specific in nature. While we have some relevant information, you may want to contact our support team for more personalized assistance.",
                contactInfo: { email: "support@example.com", phone: "1-800-XXX-YYYY", supportHours: "24/7" },
                partialInfo: "Based on our documentation, we can provide some general information, but for specific details, please contact support."
            };
        }
    },

    Irrelevant(query, conversationContext = "") {
        return {
            type: "IRRELEVANT",
            message: "I'm sorry, I'm unable to assist with your query. Please contact our support team for further assistance. Conversation Context: " + conversationContext,
            contactInfo: { email: "tech@support.com", phone: "1-800-XXX-YYYY", supportHours: "24/7" },
            ticketPriority: "High"
        };
    }
};

module.exports = responseService;