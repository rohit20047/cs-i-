const { AstraDBVectorStore, embeddings, astraConfig } = require('../config/modelConfig');

const documentService = {
    async getRelevantDocuments(query) {
        try {
            const vectorStore = await AstraDBVectorStore.fromExistingIndex(embeddings, astraConfig);
            const retriever = vectorStore.asRetriever({
                searchType: "similarity",
                searchKwargs: { k: 5 },
            });
            const docs = await retriever.getRelevantDocuments(query);
            console.log("relevant docs ", docs);
            return docs;
        } catch (error) {
            console.error("Error retrieving documents:", error);
            return [];
        }
    }
};

module.exports = documentService;