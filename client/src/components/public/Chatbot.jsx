import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';

export default function Chatbot() {
    const [settings, setSettings] = useState(null);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL || '/api'}/admin/public/chatbot`)
            .then((res) => {
                const chatbot = res.data?.data;
                if (chatbot?.enabled) {
                    setSettings(chatbot);
                    setMessages([{ role: 'assistant', content: chatbot.greeting }]);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    if (!settings || !settings.enabled) return null;

    const color = settings.primaryColor || '#2d6a4f';
    const position = settings.position === 'bottom-left' ? 'left-4' : 'right-4';

    const handleSend = async () => {
        const msg = input.trim();
        if (!msg || loading) return;
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: msg }]);
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/public/chatbot/chat`, { message: msg });
            setMessages((prev) => [...prev, { role: 'assistant', content: res.data.data?.reply || 'Sorry, try again.' }]);
        } catch {
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, having trouble. Try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        setMessages([{ role: 'assistant', content: settings.greeting }]);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setOpen(!open)}
                className={`fixed ${position} bottom-4 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95`}
                style={{ backgroundColor: color }}
                title={settings.name}
            >
                {open ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Chat Window */}
            {open && (
                <div className={`fixed ${position} bottom-16 sm:bottom-20 z-50 w-[calc(100vw-2rem)] max-w-[350px] sm:w-96 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden`}>
                    {/* Header */}
                    <div className="p-3 sm:p-4 text-white flex items-center justify-between" style={{ backgroundColor: color }}>
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <Bot className="w-5 h-5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{settings.name}</p>
                                <p className="text-xs opacity-80">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={handleClear} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors" title="Clear chat">
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="h-64 sm:h-80 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs`}
                                    style={{ backgroundColor: m.role === 'assistant' ? color : '#6b7280' }}
                                >
                                    {m.role === 'assistant' ? <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                </div>
                                <div
                                    className={`max-w-[80%] px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-sm ${
                                        m.role === 'assistant'
                                            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-md shadow-sm'
                                            : 'text-white rounded-tr-md'
                                    }`}
                                    style={{ backgroundColor: m.role === 'user' ? color : undefined }}
                                >
                                    <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: color }}>
                                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: color }} />
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: color, animationDelay: '0.15s' }} />
                                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: color, animationDelay: '0.3s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 min-w-0"
                            style={{ '--tw-ring-color': color }}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-50 flex-shrink-0"
                            style={{ backgroundColor: color }}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}