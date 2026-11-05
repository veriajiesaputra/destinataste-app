import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendMessageToAI } from '../services/api';
import MarkdownView from './MarkdownView';
import logo from '../assets/logo.png';

export default function ChatBot() {
  const { user, token, isPengunjung } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Inisialisasi pesan sambutan sesuai nama pengguna saat login
  useEffect(() => {
    if (user) {
      setMessages([
        {
          role: 'model',
          text: `Halo, **${user.name}**! Saya **DestinaTaste AI** 🌴🍲.\n\nMau cari pemandian air hangat di Guci, sate kambing muda empuk, soto tauco sedap, atau oleh-oleh khas Tegal? Tanyakan apa saja, saya siap merekomendasikan tempat terbaik!`,
          destinations: [],
        },
      ]);
    }
  }, [user]);

  // Auto scroll ke bawah saat pesan baru masuk
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Handle Kirim Pesan (Hanya jika login)
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading || !token) return;

    const userMessage = { role: 'user', text: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const history = newMessages
        .filter((m) => m.role === 'user' || m.role === 'model')
        .map((m) => ({ role: m.role, text: m.text }));

      // Kirim pesan dengan menyertakan token otentikasi login
      const response = await sendMessageToAI(text.trim(), history, token);

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: response.reply,
          destinations: response.recommendedDestinations || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ Maaf, terjadi kendala: ${error.message}\n\nSilakan coba tanyakan kembali beberapa saat lagi.`,
          destinations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Chip Rekomendasi Cepat
  const quickPrompts = [
    '🔥 Kuliner legendaris paling populer di Tegal',
    '🌲 Wisata alam pemandian air hangat Guci',
    '🫖 Oleh-oleh khas Tegal yang tahan lama',
    '🗺️ Rekomendasi rute 1 hari liburan di Tegal',
  ];

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      
      {/* 1. TOMBOL FLOATING CHATBOT */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-full p-2.5 sm:px-4 sm:py-2.5 shadow-xl hover:shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-emerald-500/30"
          title="Tanya DestinaTaste AI"
        >
          <img
            src={logo}
            alt="Logo"
            className="w-7 h-7 object-contain rounded-full bg-white/20 p-0.5 shrink-0"
          />
          <span className="font-bold text-xs sm:text-sm tracking-tight hidden sm:inline">
            DestinaTaste AI
          </span>
          {isPengunjung && (
            <span className="bg-amber-400 text-emerald-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase hidden sm:inline">
              🔒 Login
            </span>
          )}
        </button>
      )}

      {/* 2. JENDELA CHATBOT */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[92vw] sm:w-[400px] h-[560px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* HEADER CHAT */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <img
                src={logo}
                alt="Logo"
                className="w-8 h-8 rounded-full object-contain bg-white/15 p-0.5 shadow-inner shrink-0"
              />
              <div>
                <h3 className="font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                  DestinaTaste AI
                  {user && (
                    <span className="bg-emerald-600/80 text-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize">
                      {user.role}
                    </span>
                  )}
                </h3>
                <span className="text-[10px] text-emerald-200">Pemandu Cerdas Wisata & Kuliner Tegal</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/15 rounded-lg text-emerald-200 hover:text-white text-base font-bold transition cursor-pointer"
              title="Tutup chat"
            >
              ✕
            </button>
          </div>

          {/* KONDISI JIKA PENGUNJUNG BELUM LOGIN (LOCKED STATE) */}
          {!user ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-50/70">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-4 shadow-sm border border-amber-200">
                🔒
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">
                Akses Eksklusif Pengguna Terdaftar
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mb-6">
                Fitur asisten cerdas <strong className="text-slate-800 font-bold">DestinaTaste AI</strong> khusus tersedia untuk pengguna yang telah masuk akun. Silakan masuk atau daftar untuk berkonsultasi seputar wisata &amp; kuliner Tegal.
              </p>
              
              <div className="w-full max-w-xs space-y-2.5">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center transition shadow-xs"
                >
                  Masuk ke Akun Anda
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center transition"
                >
                  Daftar Akun Pengguna Baru
                </Link>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/80 w-full text-[11px] text-slate-400">
                💡 Tersedia opsi <em>Login Demo Cepat</em> di halaman Masuk.
              </div>
            </div>
          ) : (
            // KONDISI JIKA SUDAH LOGIN (PENGGUNA / ADMIN)
            <>
              {/* BODY CHAT (LIST PESAN) */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-slate-50/50">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-700 text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      <MarkdownView content={msg.text} isUser={msg.role === 'user'} />
                    </div>

                    {/* Card Destinasi Terkait dari Database */}
                    {msg.destinations && msg.destinations.length > 0 && (
                      <div className="mt-2 space-y-1.5 max-w-[85%] w-full">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          📍 Rekomendasi Terkait di Tegal:
                        </span>
                        {msg.destinations.map((d) => (
                          <Link
                            key={d.id}
                            to={`/detail/${d.id}`}
                            onClick={() => setIsOpen(false)}
                            className="bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl p-2 flex items-center justify-between transition shadow-2xs group"
                          >
                            <div className="truncate mr-2">
                              <span className="font-bold text-slate-900 text-[11px] block truncate group-hover:text-emerald-700">
                                {d.title}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate block">
                                📍 {d.location} • {d.price}
                              </span>
                            </div>
                            <span className="text-emerald-700 font-bold text-[11px] whitespace-nowrap">
                              Lihat →
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Indicator Typing */}
                {loading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs bg-white border border-slate-200 w-fit px-3 py-2 rounded-2xl shadow-2xs">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[11px] text-slate-500 font-medium ml-1">
                      DestinaTaste AI sedang menyusun rekomendasi...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* QUICK PROMPTS CHIPS */}
              {messages.length <= 2 && (
                <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer border border-slate-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* INPUT FORM */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tanya DestinaTaste AI tentang wisata atau kuliner Tegal..."
                  disabled={loading}
                  className="flex-1 px-3.5 py-2.5 rounded-full border border-slate-200 text-xs focus:outline-emerald-600 bg-slate-50 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="w-9 h-9 rounded-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs cursor-pointer flex-shrink-0"
                  title="Kirim pesan"
                >
                  ➤
                </button>
              </form>
            </>
          )}

        </div>
      )}

    </div>
  );
}
