"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import type { Message, ChatResponse } from "@/types/chat";
import { FaMicrophone, FaStop, FaPaperPlane, FaRegCopy, FaLanguage, FaEllipsisV } from "react-icons/fa";
import { MdTranslate } from "react-icons/md";
import { toast } from "react-hot-toast";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ThemeToggle from "@/components/ThemeToggle";
import { sendChatMessage, formatChatMessage } from "@/libs/chat";

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { data: session, status } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [transcriptionMode, setTranscriptionMode] = useState<'transcribe' | 'translate'>('transcribe');
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<string>('en');
  const [showSettings, setShowSettings] = useState(false);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm' // More widely supported than WAV
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Create blob from all chunks
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        // Optional: Preview the audio
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }

        // Create form data
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('mode', transcriptionMode);
        formData.append('options', JSON.stringify({
          language: transcriptionLanguage,
          prompt: "This is a conversation about AI and technology",
          temperature: 0.3,
          response_format: 'json'
        }));

        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const { text } = await response.json();
            setInput(text);
            toast.success('Audio transcribed successfully');
          } else {
            const error = await response.json();
            toast.error(error.error || 'Failed to transcribe audio');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Failed to transcribe audio');
        }
      };

      // Start recording with smaller time slices
      recorder.start(100); // Collect data every 100ms
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('Recording started');
    } catch (err) {
      console.error('Microphone error:', err);
      toast.error("Unable to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaRecorder]);

  // File handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    // Handle file upload logic here
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send current message and conversation history
      const response = await sendChatMessage(
        userMessage.content,
        messages // This includes all previous messages
      );
      
      setMessages((prev) => [...prev, {
        content: response.message,
        role: "assistant",
        timestamp: new Date(),
        type: response.type,
        data: response.data,
      }]);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-4">
      {status === "loading" ? (
        <div className="flex justify-center items-center min-h-[600px]">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      ) : !session ? (
        <div className="bg-base-200 rounded-box p-8 text-center min-h-[600px] flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to Functions
          </h2>
          <p className="text-base-content/70 mb-4 max-w-md">
            Your AI-powered assistant for voice transcription and multilingual communication
          </p>
          <button 
            onClick={() => signIn()}
            className="btn btn-primary btn-lg gap-2"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Settings Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="dropdown">
                <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                  <FaLanguage className="w-4 h-4" />
                  {transcriptionLanguage.toUpperCase() || 'Auto'}
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
                  <li><a onClick={() => setTranscriptionLanguage('')}>Auto Detect</a></li>
                  <li><a onClick={() => setTranscriptionLanguage('en')}>English</a></li>
                  <li><a onClick={() => setTranscriptionLanguage('es')}>Spanish</a></li>
                  <li><a onClick={() => setTranscriptionLanguage('fr')}>French</a></li>
                  <li><a onClick={() => setTranscriptionLanguage('de')}>German</a></li>
                </ul>
              </div>
              <div className="dropdown">
                <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                  <MdTranslate className="w-4 h-4" />
                  {transcriptionMode === 'translate' ? 'Translate' : 'Transcribe'}
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52">
                  <li><a onClick={() => setTranscriptionMode('transcribe')}>Transcribe (Original)</a></li>
                  <li><a onClick={() => setTranscriptionMode('translate')}>Translate to English</a></li>
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-8">
                    <span className="text-xs">{session.user?.name?.charAt(0) || '?'}</span>
                  </div>
                </div>
                <span className="text-sm opacity-70">{session.user?.name}</span>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div 
            className={`bg-base-200/50 backdrop-blur-sm rounded-box p-4 min-h-[600px] flex flex-col ${
              isDragging ? "border-2 border-primary border-dashed" : ""
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={() => setIsDragging(false)}
          >
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-base-300">
              {messages.length === 0 && (
                <div className="text-center text-base-content/70 mt-8">
                  <div className="flex justify-center mb-4">
                    <FaMicrophone className="w-12 h-12 opacity-20" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start Recording or Type</h3>
                  <p className="text-sm">Use voice commands or drop files here</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat ${
                    msg.role === "user" ? "chat-end" : "chat-start"
                  }`}
                >
                  <div className="chat-header opacity-50 text-xs">
                    {msg.role === "user" ? session.user?.name || "You" : "Assistant"}
                    <time className="ml-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </time>
                  </div>
                  <div
                    className={`chat-bubble relative group ${
                      msg.role === "user"
                        ? "chat-bubble-primary"
                        : "chat-bubble-secondary"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      className="prose prose-sm max-w-none"
                    >
                      {msg.content}
                    </ReactMarkdown>
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaRegCopy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat chat-start">
                  <div className="chat-bubble bg-base-300">
                    <span className="loading loading-dots loading-sm"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form with Visual Feedback */}
            <div className="mt-4 border-t border-base-300 pt-4">
              <form onSubmit={handleSubmit} className="flex gap-3 items-end relative">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder={isRecording ? "Recording..." : "Type or use voice commands..."}
                    className="textarea textarea-bordered w-full min-h-[60px] pr-12 resize-none bg-base-100/50 focus:bg-base-100"
                    disabled={isLoading || isRecording}
                  />
                  
                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute left-0 -top-6 flex items-center gap-2 text-sm text-error">
                      <span className="inline-block w-2 h-2 bg-error rounded-full animate-pulse"></span>
                      Recording...
                    </div>
                  )}

                  {/* Send Button - Positioned inside textarea */}
                  <button
                    type="submit"
                    className="absolute right-2 bottom-2 btn btn-circle btn-sm btn-primary"
                    disabled={isLoading || !input.trim() || isRecording}
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <FaPaperPlane className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Voice Recording Button */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`btn ${
                    isRecording 
                      ? 'btn-error hover:btn-error' 
                      : 'btn-ghost hover:btn-primary'
                  } btn-circle`}
                  data-tip={isRecording ? 'Stop recording' : 'Start recording'}
                  disabled={isLoading}
                >
                  {isRecording ? (
                    <div className="relative">
                      <FaStop className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full animate-ping"></span>
                    </div>
                  ) : (
                    <FaMicrophone className="w-4 h-4" />
                  )}
                </button>
              </form>

              {/* Optional: Input Actions */}
              <div className="flex justify-between items-center mt-2 text-xs text-base-content/60">
                <div className="flex gap-2">
                  <span>⌘/Ctrl + Enter to send</span>
                  <span>•</span>
                  <span>Shift + Enter for new line</span>
                </div>
                <div className="flex items-center gap-2">
                  {transcriptionMode === 'translate' && (
                    <span className="flex items-center gap-1">
                      <MdTranslate className="w-3 h-3" />
                      Translating to English
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <audio ref={audioRef} className="hidden" controls />
    </div>
  );
} 