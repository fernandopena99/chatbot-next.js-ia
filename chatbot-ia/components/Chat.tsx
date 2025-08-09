"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";


interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem("chatHistory");
        if (saved) setMessages(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (messages.length > 0)
            localStorage.setItem("chatHistory", JSON.stringify(messages));
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = { role: "user" as const, content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const res = await axios.post("/api/chat", { message: input });
            const reply = res.data.reply as string;

            let typed = "";
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            for (let i = 0; i < reply.length; i++) {
                typed += reply[i];
                setMessages((prev) => [
                    ...prev.slice(0, -1),
                    { role: "assistant", content: typed },
                ]);
                await new Promise((r) => setTimeout(r, 15));
            }

            setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "assistant", content: reply },
            ]);
        } catch (e) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "⚠️ Error al conectar con la IA." },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    const renderAssistantContent = (text: string) => {
        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const lang = match ? match[1] : "";

                        if (!inline) {
                            return (
                                <div className="my-2 text-sm">
                                    <SyntaxHighlighter
                                        style={oneDark} // oneDark se usa como estilo por defecto
                                        language={lang}
                                        PreTag="div"
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                </div>
                            );
                        }

                        return (
                            <code className="px-1 rounded bg-gray-200 text-sm" {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {text}
            </ReactMarkdown>
        );
    };

    return (
        <div className="max-w-2xl mx-auto p-4 rounded-lg shadow bg-white min-h-[80vh] flex flex-col">
            <header className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    💬 Chatbot IA
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setMessages([]);
                            localStorage.removeItem("chatHistory");
                        }}
                        className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
                        title="Borrar historial"
                    >
                        Borrar historial
                    </button>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto border rounded p-3 bg-gray-50">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"
                            }`}
                    >
                        <div
                            className={`inline-block px-4 py-2 rounded-lg max-w-[85%] break-words ${msg.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                        >
                            {msg.role === "assistant"
                                ? renderAssistantContent(msg.content)
                                : msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="text-left text-gray-500 italic mb-2">
                        Escribiendo...
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 mt-4">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 border rounded px-3 py-2 bg-white text-gray-900"
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isTyping}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    disabled={isTyping}
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}