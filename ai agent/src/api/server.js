const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const rag = require('../rag');
const conversationMemoryService = require('../services/conversationMemoryService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build
const frontendPath = path.join(__dirname, '../../frontend/chat_ai/build');
app.use(express.static(frontendPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main query endpoint
app.post('/api/query', async (req, res) => {
    try {
        const { query, sessionId } = req.body;
        console.log(`Processing query for session: ${sessionId || 'null'}`);
        console.log(`Query: "${query}"`);
        
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ error: 'Query is required and must be a string' });
        }

        // Use the sessionId when calling askQuestion
        const response = await rag.askQuestion(query, sessionId);
        
        // Generate a new sessionId if one wasn't provided
        if (!sessionId) {
            response.sessionId = uuidv4();
            console.log(`Generated new session ID: ${response.sessionId}`);
        } else {
            response.sessionId = sessionId;
        }
        
        console.log(`Response type: ${response.type}`);
        res.json(response);
    } catch (error) {
        console.error("Error processing query:", error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Product request endpoint
app.post('/api/product-request', async (req, res) => {
    try {
        const { email, username, productName, sessionId = uuidv4() } = req.body;
        
        if (!email || !username || !productName) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Email, username, and productName are required'
            });
        }

        // Add product request to conversation history
        await conversationMemoryService.addMessage(sessionId, {
            text: `Product request: ${productName} by ${username} (${email})`,
            sender: 'user'
        });

        // Generate a ticket ID
        const ticketId = `PRD-${Math.floor(Math.random() * 10000)}`;
        
        // Add response to conversation history
        await conversationMemoryService.addMessage(sessionId, {
            text: `Thank you! Your product request has been submitted. A confirmation email will be sent to ${email} shortly. Your ticket reference is: ${ticketId}`,
            sender: 'ai'
        });

        res.json({ 
            success: true, 
            ticketId,
            sessionId
        });
    } catch (error) {
        console.error('Error processing product request:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

const PORT = process.env.PORT || 3001;

// Start server
function startServer() {
    try {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Query endpoint: http://localhost:${PORT}/api/query`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Export for testing purposes
module.exports = { app, startServer };

// Start the server if this file is run directly
if (require.main === module) {
    startServer();
}
