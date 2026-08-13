import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getChats, getChat, startChat, sendMessage, deleteChat, updateChatTitle } from '../../api/chat';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatters';
import {
    Send, Bot, User, Trash2, Sparkles,
    Cloud, Bug, Wheat, Languages,
    Plus, Edit3, Check, X, Search, MessageCircle, ArrowLeft, PanelLeft,
} from 'lucide-react';

const suggestions = {
    en: [
        { icon: Bug, text: 'Crop disease signs', prompt: 'What signs show my crops have disease?' },
        { icon: Cloud, text: 'Weather impact', prompt: 'How does weather affect my farming?' },
        { icon: Wheat, text: 'Soil & fertilizer', prompt: 'What fertilizer should I use?' },
        { icon: Sparkles, text: 'Farm optimization', prompt: 'How can I improve my farm?' },
    ],
    sw: [
        { icon: Bug, text: 'Dalili za magonjwa', prompt: 'Nitajuaje kama mimea yangu ina magonjwa?' },
        { icon: Cloud, text: 'Athari za hewa', prompt: 'Hali ya hewa inaathiri vipi kilimo?' },
        { icon: Wheat, text: 'Udongo na mbolea', prompt: 'Nitumie mbolea gani kupata mavuno bora?' },
        { icon: Sparkles, text: 'Boresha shamba', prompt: 'Nifanye nini kuboresha uzalishaji?' },
    ],
};

export default function AIAssistant() {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const [showSidebar, setShowSidebar] = useState(false);
    const [lang, setLang] = useState(() => {
        try { return localStorage.getItem('farmvexa_chat_lang') || 'en'; }
        catch { return 'en'; }
    });
    const [editingTitle, setEditingTitle] = useState(false);
    const [title, setTitle] = useState('');

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        getChats().then((res) => setChats(res.data.data.chats || [])).finally(() => setLoading(false));
    }, []);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    useEffect(() => { localStorage.setItem('farmvexa_chat_lang', lang); }, [lang]);
    useEffect(() => { inputRef.current?.focus(); }, [activeChat]);

    const openChat = async (chatId) => {
        try {
            const res = await getChat(chatId);
            const c = res.data.data.chat;
            setActiveChat(c);
            setMessages(c.messages || []);
            setTitle(c.title);
            setShowSidebar(false);
        } catch {}
    };

    const newChat = () => {
        setActiveChat({ _id: null, title: 'New Chat' });
        setMessages([]);
        setTitle('New Chat');
        setShowSidebar(false);
    };

    const handleSend = async (text) => {
        const msg = text || input.trim();
        if (!msg || sending) return;
        setInput('');
        const userMsg = { role: 'user', content: msg, timestamp: new Date().toISOString() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setSending(true);
        try {
            const finalMsg = lang === 'sw' ? `${msg}\n\n[Respond in Swahili]` : msg;
            let res;
            if (!activeChat?._id) {
                res = await startChat({ message: finalMsg });
            } else {
                res = await sendMessage(activeChat._id, finalMsg);
            }
            const c = res.data.data.chat;
            setActiveChat(c);
            setMessages(c.messages);
            setTitle(c.title);
            getChats().then((r) => setChats(r.data.data.chats || []));
        } catch (err) {
            const errorMsg = err.response?.data?.message || (lang === 'sw' ? 'Samahani, nina shida.' : 'Sorry, try again.');
            setMessages([...newMessages, { role: 'assistant', content: errorMsg, timestamp: new Date().toISOString() }]);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm('Delete chat?')) return;
        await deleteChat(id);
        setChats((prev) => prev.filter((c) => c._id !== id));
        if (activeChat?._id === id) newChat();
    };

    const saveTitle = async () => {
        if (title.trim() && activeChat?._id) {
            await updateChatTitle(activeChat._id, title);
            setEditingTitle(false);
            getChats().then((r) => setChats(r.data.data.chats || []));
        }
    };

    const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }) : '';
    const currentSuggestions = suggestions[lang] || suggestions.en;
    const filteredChats = chats.filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <Spinner size="lg" className="mt-20" />;

    return (
        <div className="flex h-[calc(100vh-7rem)] gap-0">
            {/* Sidebar */}
            <div className={`${showSidebar ? 'block' : 'hidden'} md:block w-72 lg:w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col rounded-l-2xl absolute md:relative z-30 h-full`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <Button onClick={newChat} className="w-full"><Plus className="w-4 h-4" /> New Chat</Button>
                </div>
                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredChats.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm"><MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />{search ? 'No results' : 'No chats yet'}</div>
                    )}
                    {filteredChats.map((c) => (
                        <div key={c._id} onClick={() => openChat(c._id)} className={`px-4 py-3 cursor-pointer transition-colors group ${activeChat?._id === c._id ? 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-2 border-transparent'}`}>
                            <div className="flex items-center justify-between">
                                <p className="font-medium text-sm truncate flex-1">{c.title || 'New Chat'}</p>
                                <button onClick={(e) => handleDelete(e, c._id)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{c.messages?.length || 0} msgs · {formatDate(c.lastMessageAt || c.createdAt, 'relative')}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {showSidebar && <div className="md:hidden fixed inset-0 z-20 bg-black/50" onClick={() => setShowSidebar(false)} />}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-r-2xl border border-gray-200 dark:border-gray-800 md:border-l-0 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                            <PanelLeft className="w-5 h-5" />
                        </button>
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-green-600 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        {editingTitle ? (
                            <div className="flex items-center gap-2">
                                <input value={title} onChange={(e) => setTitle(e.target.value)} className="text-base font-bold bg-transparent border-b-2 border-primary-500 text-gray-900 dark:text-gray-100 focus:outline-none px-1 w-40" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); }} />
                                <button onClick={saveTitle} className="p-1 text-green-500"><Check className="w-4 h-4" /></button>
                                <button onClick={() => setEditingTitle(false)} className="p-1 text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <div className="min-w-0">
                                <h1 className="text-base font-bold truncate flex items-center gap-1 cursor-pointer" onClick={() => activeChat?._id && setEditingTitle(true)}>
                                    {title || 'New Chat'}
                                    {activeChat?._id && <Edit3 className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                                </h1>
                                <p className="text-xs text-gray-400">{lang === 'sw' ? 'Msaidizi wa AI' : 'AI Assistant'}</p>
                            </div>
                        )}
                    </div>
                    <Button variant="outline" onClick={() => setLang(lang === 'en' ? 'sw' : 'en')} className="flex items-center gap-1 text-sm px-2.5 py-1.5">
                        <Languages className="w-4 h-4" />
                        <span className="hidden sm:inline">{lang === 'en' ? 'Kiswahili' : 'English'}</span>
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                    {messages.length === 0 && (
                        <>
                            <div className="text-center py-6">
                                <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <h2 className="text-lg font-bold">{lang === 'sw' ? `Habari, ${user?.name?.split(' ')[0] || 'Mkulima'}!` : `Hello, ${user?.name?.split(' ')[0] || 'Farmer'}!`}</h2>
                                <p className="text-gray-500 text-sm">{lang === 'sw' ? 'Msaidizi wako wa kilimo.' : 'Your AI farm assistant.'}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                                {currentSuggestions.map((s, i) => (
                                    <button key={i} onClick={() => handleSend(s.prompt)} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all text-left group">
                                        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 group-hover:bg-primary-100"><s.icon className="h-4 w-4 text-primary-600" /></div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.text}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-2 ${msg.role === 'user' && 'flex-row-reverse'}`}>
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'assistant' ? 'bg-gradient-to-br from-primary-500 to-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'}`}>
                                {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div className={`max-w-[80%] ${msg.role === 'user' && 'items-end'}`}>
                                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-md' : 'bg-primary-600 text-white rounded-tr-md'}`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <p className={`text-[10px] text-gray-400 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>{formatTime(msg.timestamp)}</p>
                            </div>
                        </div>
                    ))}
                    {sending && (
                        <div className="flex gap-2">
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-500 to-green-600 flex items-center justify-center"><Bot className="h-4 w-4 text-white" /></div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3"><div className="flex gap-1.5"><span className="h-2 w-2 bg-primary-400 rounded-full animate-bounce" /><span className="h-2 w-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} /><span className="h-2 w-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} /></div></div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex gap-2">
                        <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={lang === 'en' ? 'Ask about farming...' : 'Uliza kuhusu kilimo...'} rows={1} className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" disabled={sending} />
                        <Button onClick={() => handleSend()} disabled={!input.trim() || sending} className="rounded-xl px-3"><Send className="h-5 w-5" /></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}