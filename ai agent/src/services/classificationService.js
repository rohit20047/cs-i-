const { model } = require('../config/modelConfig');
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence } = require("@langchain/core/runnables");
const { StringOutputParser } = require("@langchain/core/output_parsers");

const classificationService = {
    async classifyQuery(query, context = "", conversationContext = "") {

        const newProductPrompt = ChatPromptTemplate.fromTemplate(`
            Analyze the following query to determine if it's related to a "new product RESQUEST" from the custumer. check weather the query is related to new product request , dont consider if it related to product enquiry            Note: Check for keywords like "new", "product", "i want a new product", etc.
    
            Query: {query}
            
            Respond with just one word: YES or NO.
        `);
    
        const newProductChain = RunnableSequence.from([
            newProductPrompt,
            model,
            new StringOutputParser()
        ]);
    
        const isNewProduct = await newProductChain.invoke({ query });
        if (isNewProduct.trim().toUpperCase() === 'YES') {
            return { type: "PRODUCT_REQUEST", priority: "HIGH" };
        }


        const hasRelevantDocs = await this.checkDocumentRelevance(query, context);
        if (hasRelevantDocs) {
            return { type: "TECHNICAL_WITH_DOCS" };
        }
    
       
    
        const classificationPrompt = ChatPromptTemplate.fromTemplate(`
            Analyze the following query to classify it into one of these categories.
            Note: Documentation-based queries have already been handled, so focus on other aspects.
    
            Categories:
            - TECHNICAL_NO_DOCS: If it's a technical question related to Personal problem related to tech, internet, website etc user (but no relevant docs are available). consider greeting from user as a query
            - IRRELEVANT: If it doesn't fit any of the above categories or is completely unrelated like games, sports, entertainment or personal details
            
            Query: {query}
            
            Respond with just one word: TECHNICAL_NO_DOCS or IRRELEVANT.
        `);
    
        const classificationChain = RunnableSequence.from([
            classificationPrompt,
            model,
            new StringOutputParser()
        ]);
    
        const classification = await classificationChain.invoke({ query });
        return { type: classification.trim().toUpperCase() };
    },

    async checkDocumentRelevance(query, context) {
        if (!context || context.trim() === "") {
            return false;
        }

        const relevancePrompt = ChatPromptTemplate.fromTemplate(`
            Analyze if the following context contains any information relevant to answer the query.
            Make sure you understand the query and understand the documentation, understand the context provided, carefully check the context provided.
            consider it as yes if the customer is asking greeting you

            Query: {query}
            
            Context: {context}
            
            Respond with just one word: YES or NO.
        `);

        const relevanceChain = RunnableSequence.from([
            relevancePrompt,
            model,
            new StringOutputParser()
        ]);

        const relevanceCheck = await relevanceChain.invoke({ query, context });
        return relevanceCheck.trim().toUpperCase() === 'YES';
    }
};

module.exports = classificationService;