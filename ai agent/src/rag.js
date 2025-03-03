const documentService = require('./services/documentService');
const classificationService = require('./services/classificationService');
const responseService = require('./services/responseService');
const conversationMemoryService = require('./services/conversationMemoryService');

async function askQuestion(query, sessionId = null) {
    try {
        let conversationContext = "";
        if (sessionId) {
            const relevantMessages = await conversationMemoryService.findRelevantMessages(sessionId, query);
            console.log(`Found ${relevantMessages.length} relevant messages from history`);
            conversationContext = relevantMessages
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n\n');
            if (conversationContext) console.log("Using conversation context:", conversationContext);
        }

        const relevantDocs = await documentService.getRelevantDocuments(query);
        let context = "";
        let hasRelevantContext = false;

        if (Array.isArray(relevantDocs) && relevantDocs.length > 0) {
            const processedDocs = relevantDocs.map(doc => ({
                content: doc.pageContent,
                metadata: doc.metadata || {}
            }));
            context = processedDocs.map((doc, index) => {
                return `Document ${index + 1}${doc.metadata.title ? ` - ${doc.metadata.title}` : ''}:\n${doc.content}`;
            }).join('\n\n---\n\n');
            console.log(`Processed ${processedDocs.length} relevant documents for context`);
            hasRelevantContext = context.trim().length > 0;
        }

        const classification = await classificationService.classifyQuery(query, context, conversationContext);
        console.log(`Query classified as: ${classification.type}`);

        let response;
        if (classification.type === "PRODUCT_REQUEST") {
            response =await responseService.presentNewProductRequest();
        }
        else if(classification.type === "TECHNICAL_WITH_DOCS" && hasRelevantContext) {
            response = await responseService.presentTechnicalAnswer(query, context, conversationContext);
        } else if (classification.type === "TECHNICAL_NO_DOCS") {
            response = await responseService.presentTechnicalAnswerNoDocs(query, context, conversationContext);
        } else {
            response = responseService.Irrelevant(query, conversationContext);
        }

        if (sessionId) {
            await conversationMemoryService.addMessage(sessionId, "user", query);
            let aiResponseContent = response.type === "TECHNICAL_WITH_DOCS" ? response.answer : response.answer || response.message;
            await conversationMemoryService.addMessage(sessionId, "assistant", aiResponseContent);
        }
        console.log("Response generated:", response);
        return response;
    } catch (error) {
        console.error("Error in askQuestion:", error);
        return {
            type: "ERROR",
            message: "Sorry, I encountered an error while processing your request. Please try again."
        };
    }
}

module.exports = { askQuestion };