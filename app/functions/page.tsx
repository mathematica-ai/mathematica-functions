"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import type { Message, ChatResponse } from "@/types/chat";
import { FaMicrophone, FaStop, FaPaperPlane, FaRegCopy, FaLanguage, FaPlay, FaPause, FaCog, FaVolumeUp } from "react-icons/fa";
import { MdTranslate } from "react-icons/md";
import { toast } from "react-hot-toast";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Header from "@/components/Header";
import { sendChatMessage } from "@/libs/chat";

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
  const [isPlaying, setIsPlaying] = useState<{ [key: number]: boolean }>({});
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null as SpeechSynthesisVoice | null
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

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

  // Initialize available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis?.getVoices() || [];
      const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
      if (englishVoice) {
        setVoiceSettings(prev => ({ ...prev, voice: englishVoice }));
      }
    };

    // Load voices immediately and also listen for the voiceschanged event
    loadVoices();
    speechSynthesis?.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Voice settings component
  const VoiceSettingsPanel = () => (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
        <FaCog className="w-3 h-3" />
      </label>
      <div tabIndex={0} className="dropdown-content z-[1] p-4 shadow bg-base-200 rounded-box w-64">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FaVolumeUp className="w-4 h-4" />
          Voice Settings
        </h3>
        <div className="space-y-3">
          <div>
            <label className="label">
              <span className="label-text">Speed</span>
              <span className="label-text-alt">{voiceSettings.rate}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.rate}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
              className="range range-xs"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Pitch</span>
              <span className="label-text-alt">{voiceSettings.pitch}</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.pitch}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
              className="range range-xs"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Volume</span>
              <span className="label-text-alt">{voiceSettings.volume * 100}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={voiceSettings.volume}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
              className="range range-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const toggleSpeech = (idx: number, text: string) => {
    if (isPlaying[idx]) {
      speechSynthesis?.cancel();
      setIsPlaying(prev => ({ ...prev, [idx]: false }));
    } else {
      // Cancel any currently playing speech
      speechSynthesis?.cancel();
      
      // Create new utterance with enhanced settings
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice settings
      if (voiceSettings.voice) {
        utterance.voice = voiceSettings.voice;
      }
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      // Handle events
      utterance.onstart = () => {
        setIsPlaying(prev => {
          const newState = { ...prev };
          // Reset all other playing states
          Object.keys(newState).forEach(key => {
            newState[Number(key)] = false;
          });
          return { ...newState, [idx]: true };
        });
        toast.success("Started speaking", { icon: '🔊' });
      };

      utterance.onend = () => {
        setIsPlaying(prev => ({ ...prev, [idx]: false }));
        toast.success("Finished speaking", { icon: '✅' });
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(prev => ({ ...prev, [idx]: false }));
        toast.error("Error during speech synthesis", { icon: '❌' });
      };

      // Start speaking
      speechSynthesis?.speak(utterance);
    }
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      speechSynthesis?.cancel();
    };
  }, []);

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
                        : "chat-bubble bg-neutral/20"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      className="prose prose-sm max-w-none"
                    >
                      {msg.content}
                    </ReactMarkdown>
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {msg.role === "assistant" && (
                        <>
                          <VoiceSettingsPanel />
                          <button
                            onClick={() => toggleSpeech(idx, msg.content)}
                            className="btn btn-ghost btn-xs btn-circle tooltip tooltip-left hover:bg-base-300 transition-colors duration-200"
                            data-tip={isPlaying[idx] ? "Stop speaking" : "Read aloud"}
                          >
                            {isPlaying[idx] ? (
                              <FaPause className="w-3 h-3 text-error animate-pulse" />
                            ) : (
                              <FaPlay className="w-3 h-3 text-success hover:scale-110 transition-transform duration-200" />
                            )}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="btn btn-ghost btn-xs btn-circle tooltip tooltip-left hover:bg-base-300 transition-colors duration-200"
                        data-tip="Copy to clipboard"
                      >
                        <FaRegCopy className="w-3 h-3 hover:scale-110 transition-transform duration-200" />
                      </button>
                    </div>
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