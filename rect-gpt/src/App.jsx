import { useState, useEffect } from "react";
import openAI from "openai";


const client = new openAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: import.meta.env.VITE_API_KEY,
  dangerouslyAllowBrowser: true,
})

function App() {
  // Load saved messages from localStorage or use empty array
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved ? JSON.parse(saved) : [];
  });
  const [message, setMessage] = useState("");

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);


  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return; // ignore empty messages

    // Add user message
    const messageWithUser = [
      ...messages,
      {
        role: "user",
        content: message,
      },
    ];
    setMessage("");

    // Show loading for assistant
    setMessages([
      ...messageWithUser,
      {
        role: "assistant",
        content: "Loading...",
      },
    ]);

    // Call API
    const chatCompletion = await client.chat.completions.create({
      model: "gemma2-9b-it",
      messages: messageWithUser,
      stream: false, // you might want false for simplicity or handle streaming properly
    });

    const botMessage = chatCompletion.choices[0].message.content;

    // Replace the loading message with the actual response
    setMessages([...messageWithUser, { role: "assistant", content: botMessage }]);
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <div className="container mx-auto p-4 flex flex-col h-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">ChatUI với React + OpenAI</h1>

        <form className="flex" onSubmit={sendMessage}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tin nhắn của bạn..."
            className="flex-grow p-2 rounded-l border border-gray-300"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          >
            Gửi tin nhắn
          </button>

          <button
          onClick={clearMessages}
          className="bg-red-500 text-white px-4 py-2 rounded-r hover:bg-red-600"
          >
            Clear Chat
          </button>
        </form>

        <div className="flex-grow overflow-y-auto mt-4 bg-white rounded shadow p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 ${msg.role === "assistant" ? "text-right" : ""}`}
            >
              <p className="text-gray-600 text-sm">{msg.role}</p>
              <p
                className={`${
                  msg.role === "assistant" ? "bg-green-100" : "bg-blue-100"
                } p-2 rounded-lg inline-block`}
              >
                {msg.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
