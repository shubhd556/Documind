# 🧠 DocuMind AI

### **Chat with your PDFs, Fully Offline. Privacy-First Document Intelligence.**

DocuMind AI is a premium, browser-native document intelligence platform. Unlike traditional "Chat with PDF" apps that send your sensitive data to the cloud, DocuMind processes everything **locally on your machine** using WebGPU and Web Workers. 

No data leaves your browser. No subscriptions. Just pure, local power.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<img width="1892" height="893" alt="image" src="https://github.com/user-attachments/assets/0afe886e-3209-4998-a9a3-dd32f93aae5a" />

---

## ✨ Key Features

* **🔒 Local-First Privacy:** AI processing happens entirely in the browser via `Transformers.js`. Your documents never touch a server.
* **⛓️ AI Chain of Thought:** A transparent "Thinking" UI that shows the AI's internal reasoning steps in real-time.
* **📂 Multi-Document Sessions:** Seamlessly switch between multiple PDFs. Session history and context are preserved locally.
* **🌓 Split-View Preview:** A professional-grade, edge-to-edge PDF viewer toggled directly from the sidebar.
* **⚡ WebGPU Accelerated:** Utilizes modern hardware acceleration for lightning-fast inference on Llama 3.2 1B models.
* **🎨 Premium UI:** A modern, dark-mode SaaS aesthetic built with Tailwind CSS, Framer Motion, and Shadcn/UI.

---

## 🛠️ Tech Stack

* **Frontend:** [Next.js 15](https://nextjs.org/) / [Vite](https://vitejs.dev/)
* **AI Inference:** [Transformers.js](https://huggingface.co/docs/transformers.js/index) (Llama 3.2 1B quantized)
* **Database & Auth:** [Supabase](https://supabase.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js 18.x or higher
* A Supabase project (for Authentication)

### 2. Installation
* git clone [https://github.com/your-username/Documind.git](https://github.com/shubhd556/Documind.git)
* cd Documind
* npm install

### 3. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:

* VITE_SUPABASE_URL=your_supabase_project_url
* VITE_SUPABASE_ANON_KEY=your_supabase_anon_key



---

## 🏗️ Architecture

DocuMind uses a **Multi-Threaded Architecture** to ensure smooth performance:

### 🧩 Main Thread
- React UI rendering  
- Animations & interactions  
- File handling  
- User input  

### ⚙️ Web Worker
- Loads and runs the AI model  
- Handles inference (text generation)  
- Prevents UI blocking  

### 💾 Local Storage
- Stores chat history  
- Maintains session persistence  

---

## ⚡ Performance Strategy

- Quantized models for low memory usage  
- WebGPU / WASM fallback  
- Context trimming for faster inference  
- Chunk-based PDF processing (optional upgrade)  
- Worker-based parallel execution  

---

## 🌐 Deployment

### 🚀 Vercel (Recommended)

1. Push your project to GitHub  
2. Connect your repo to Vercel  
3. Add environment variables in dashboard  
4. Deploy  

---

### ⚠️ Important

- Ensure your **Supabase redirect URLs** include your production domain  
- Use HTTPS for WebGPU support in production  

---

## 🔮 Future Improvements

- 🔍 Semantic search (embeddings-based retrieval)  
- 📚 Multi-PDF knowledge base  
- ☁️ Cloud sync (Firestore / Supabase)  
- 🧠 Conversation memory  
- 📊 Answer citations & sources  
- 🔐 Full authentication system  
- 📱 Mobile optimization  

---

## 📜 License

Distributed under the MIT License.  
See `LICENSE` for more information.

---

## 🙌 Acknowledgments

- Hugging Face team for **Transformers.js**  
- Open-source AI community  
- Shadcn/UI inspiration for clean design  

---

## 💙 Philosophy

> Built for **Privacy**, **Speed**, and **Local Intelligence**

No cloud. No tracking. Just your data — on your device.

---

## ⭐ Support

If you like this project:

- ⭐ Star the repo  
- 🍴 Fork it  
- 🧠 Build something amazing  

---

## 👨‍💻 Author

Built with ❤️ for Privacy and Speed.
