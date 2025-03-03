const { model } = require('../config/modelConfig');
const { embeddings } = require('../ini');

class ConversationMemoryService {
    constructor() {
        // In-memory storage for conversations
        this.conversations = new Map();
        // In-memory vector storage for semantic search
        this.vectorMemory = new Map();
    }

    /**
     * Initialize a new conversation or return existing one
     * @param {string} sessionId - Unique identifier for the conversation
     * @returns {Array} - The conversation history
     */
    getOrCreateConversation(sessionId) {
        if (!this.conversations.has(sessionId)) {
            this.conversations.set(sessionId, []);
            this.vectorMemory.set(sessionId, []);
        }
        return this.conversations.get(sessionId);
    }

    /**
     * Add a message to the conversation history
     * @param {string} sessionId - Unique identifier for the conversation
     * @param {string} role - Role of the sender (user or assistant)
     * @param {string} content - Message content
     */
    async addMessage(sessionId, role, content) {
        if (!sessionId) {
            console.warn("Attempted to add message without sessionId");
            return;
        }
        console.log("content ....", content)
        
        if (!content || typeof content !== 'string') {
            console.warn("Invalid message content:", content);
            return;
        }
        
        const conversation = this.getOrCreateConversation(sessionId);
        const message = { role, content };
        conversation.push(message);
        
        try {
            // Generate embedding for the message
            const embedding = await this.generateEmbedding(content);
            
            // Store the embedding with the message
            const vectorMemory = this.vectorMemory.get(sessionId);
            vectorMemory.push({
                message,
                embedding,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error adding message to vector memory:", error);
        }
    }

    /**
     * Generate embedding for text using the embeddings model
     * @param {string} text - Text to generate embedding for
     * @returns {Array} - Vector embedding
     */
    async generateEmbedding(text) {
        try {
            if (!text || typeof text !== 'string') {
                console.warn("Invalid text for embedding:", text);
                return [];
            }
            
            // Ensure text is a non-empty string
            const sanitizedText = String(text).trim();
            if (!sanitizedText) {
                console.warn("Empty text for embedding");
                return [];
            }
            
            const result = await embeddings.embedQuery(sanitizedText);
            return result;
        } catch (error) {
            console.error("Error generating embedding:", error);
            // Return empty array as fallback
            return [];
        }
    }

    /**
     * Find relevant messages from conversation history
     * @param {string} sessionId - Unique identifier for the conversation
     * @param {string} query - Current user query
     * @param {number} limit - Maximum number of relevant messages to return
     * @returns {Array} - Relevant messages
     */
    async findRelevantMessages(sessionId, query, limit = 5) {
        console.log(`Finding relevant messages for session ${sessionId || 'null'}`);
        
        // If there's no session or no conversation, return an empty array.
        if (!sessionId || !this.conversations.has(sessionId)) {
            console.log(`No conversation found for session ${sessionId || 'null'}`);
            return [];
        }
        
        // Use raw conversation as fallback.
        const conversation = this.conversations.get(sessionId);
        // If vectorMemory is empty, return the last few messages from the conversation.
        if (!this.vectorMemory.has(sessionId) || this.vectorMemory.get(sessionId).length === 0) {
            console.log(`Vector memory is empty for session ${sessionId}, returning recent conversation messages`);
            return conversation.slice(-limit);
        }
        
        const vectorMemory = this.vectorMemory.get(sessionId);
        console.log(`Found ${vectorMemory.length} messages in vector memory for session ${sessionId}`);
        
        // If there are only a few messages, return all of them.
        if (vectorMemory.length <= limit) {
            console.log(`Returning all ${vectorMemory.length} messages from vector memory`);
            return vectorMemory.map(item => item.message);
        }
        
        try {
            // Generate embedding for the query.
            const queryEmbedding = await this.generateEmbedding(query);
            if (!queryEmbedding || queryEmbedding.length === 0) {
                console.log(`Embedding generation failed, returning ${limit} most recent conversation messages`);
                return conversation.slice(-limit);
            }
            
            // Calculate cosine similarity between query and each stored message.
            const similarities = vectorMemory.map(item => {
                if (!item.embedding || item.embedding.length === 0) {
                    return { message: item.message, similarity: 0 };
                }
                return {
                    message: item.message,
                    similarity: this.cosineSimilarity(queryEmbedding, item.embedding)
                };
            });
            
            // Sort by similarity (highest first) and return the top messages.
            similarities.sort((a, b) => b.similarity - a.similarity);
            const relevantMessages = similarities.slice(0, limit).map(item => item.message);
            console.log(`Returning ${relevantMessages.length} relevant messages based on similarity`);
            return relevantMessages;
        } catch (error) {
            console.error("Error finding relevant messages:", error);
            // Fallback to returning recent messages if something goes wrong.
            return conversation.slice(-limit);
        }
    }
    
    /**
     * Calculate cosine similarity between two vectors
     * @param {Array} vecA - First vector
     * @param {Array} vecB - Second vector
     * @returns {number} - Similarity score between 0 and 1
     */
    cosineSimilarity(vecA, vecB) {
        if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
            return 0;
        }

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) {
            return 0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Get the most recent messages from a conversation
     * @param {string} sessionId - Unique identifier for the conversation
     * @param {number} limit - Maximum number of messages to return
     * @returns {Array} - Recent messages
     */
    getRecentMessages(sessionId, limit = 5) {
        const conversation = this.getOrCreateConversation(sessionId);
        return conversation.slice(-limit);
    }

    /**
     * Format conversation history for context
     * @param {Array} messages - Array of message objects
     * @returns {string} - Formatted conversation history
     */
    formatConversationHistory(messages) {
        return messages.map(msg => 
            `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
        ).join('\n\n');
    }
}

module.exports = new ConversationMemoryService();
