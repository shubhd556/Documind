
import { pipeline, env } from '@huggingface/transformers';
// Optimization for Edge/Chrome
env.allowLocalModels = false;
env.useBrowserCache = true;
class AIModelManager {
    static instance = null;
    static modelId = 'onnx-community/Llama-3.2-1B-Instruct-ONNX';
    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            console.log("1. Initializing Pipeline...");
            try {
                this.instance = await pipeline('text-generation', this.modelId, { 
                    progress_callback,
                    dtype: 'q4', 
                    device: 'webgpu', 
                });
                console.log("2. Pipeline initialized successfully");
            } catch (err) {
                console.error("Pipeline Init Failed, falling back to WASM:", err);
                this.instance = await pipeline('text-generation', this.modelId, { 
                    progress_callback,
                    dtype: 'q4', 
                    device: 'wasm', 
                });
            }
        }
        return this.instance;
    }
}
self.onmessage = async (event) => {
    console.log("Worker received message:", event.data);
    const { text, question } = event.data;
    if (!text || !question) {
        self.postMessage({ status: 'complete', output: "Error: No text to analyze." });
        return;
    }
    try {
        // Consolidated the loading logs into the background
        const generator = await AIModelManager.getInstance(x => {
            if (x.status === 'progress') {
                self.postMessage({ status: 'loading_model', progress: x.progress });
            }
        });
        console.log(`3. Engine Ready. Processing question: "${question.slice(0, 40)}..."`);
        const cleanContext = text.replace(/\s+/g, ' ').trim().slice(0, 2500);
        const messages = [
            { role: "system", content: "Answer briefly using the context." },
            { role: "user", content: `Context: ${cleanContext}\n\nQuestion: ${question}` },
        ];
        console.log("4. Starting Inference...");
        const startTime = performance.now();
        const inferenceTimeout = setTimeout(() => {
            console.error("Timeout: Inference took longer than 30s.");
            self.postMessage({ status: 'complete', output: "The AI took too long to think. Try a shorter PDF." });
        }, 50000);
        const output = await generator(messages, {
            max_new_tokens: 128,
            temperature: 0.1,
            do_sample: false,
        });
        clearTimeout(inferenceTimeout);
        
        const endTime = performance.now();
        const responseText = output[0].generated_text.at(-1).content;
        
        console.log(`5. Inference complete in ${((endTime - startTime) / 1000).toFixed(2)}s`);
        self.postMessage({ 
            status: 'complete', 
            output: responseText || "I couldn't find a clear answer." 
        });
    } catch (error) {
        console.error("CRITICAL WORKER ERROR:", error);
        self.postMessage({ 
            status: 'complete', 
            output: `Engine Error: ${error.message}` 
        });
    }
};
