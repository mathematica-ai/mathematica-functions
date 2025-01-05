'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSession, signIn } from "next-auth/react";
import type { Message } from "@/types/chat";
import { WorkflowResponse } from '@/types/models';
import { FaMicrophone, FaStop, FaPaperPlane, FaRegCopy, FaLanguage, FaPlay, FaPause, FaCog, FaVolumeUp, FaImage } from "react-icons/fa";
import { MdTranslate } from "react-icons/md";
import { toast } from "react-hot-toast";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { sendChatMessage } from "@/libs/chat";
import Link from 'next/link';
import Image from 'next/image';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
}

export default function WorkflowPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [transcriptionMode, setTranscriptionMode] = useState<'transcribe' | 'translate'>('transcribe');
  const [transcriptionLanguage, setTranscriptionLanguage] = useState<string>('en');
  const [isPlaying, setIsPlaying] = useState<{ [key: number]: boolean }>({});
  const { speak, cancel } = useSpeechSynthesis();
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 1,
    pitch: 1,
    volume: 1
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWorkflow = useCallback(async () => {
    try {
      const response = await fetch(`/api/functions/${params.slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow');
      }
      const data = await response.json();
      setWorkflow(data);
    } catch (error) {
      toast.error('Failed to fetch workflow');
    } finally {
      setIsLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

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
        mimeType: 'audio/webm'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }

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

      recorder.start(100);
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
      cancel();
    };
  }, [mediaRecorder, cancel]);

  // File handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Handle the first file
      const file = files[0];
      // Add your file handling logic here
      console.log('File dropped:', file.name);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending || !workflow) return;

    const userMessage: Message = {
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    // Add an initial assistant message that will be updated with streaming content
    const assistantMessage: Message = {
      content: "",
      role: "assistant",
      timestamp: new Date(),
      type: "stream"
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await sendChatMessage(
        userMessage.content,
        messages,
        (chunk) => {
          // Update the assistant's message content as chunks arrive
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "assistant") {
              lastMessage.content += chunk;
            }
            return newMessages;
          });
        }
      );
      
      // Update the final message with complete response
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant") {
          lastMessage.content = response.message;
          lastMessage.type = response.type;
          lastMessage.data = response.data;
        }
        return newMessages;
      });
    } catch (error) {
      toast.error("Failed to send message");
      setMessages((prev) => prev.slice(0, -2)); // Remove both user message and assistant message
      setInput(userMessage.content);
    } finally {
      setIsSending(false);
    }
  };

  const toggleSpeech = (idx: number, text: string) => {
    if (isPlaying[idx]) {
      cancel();
      setIsPlaying(prev => ({ ...prev, [idx]: false }));
    } else {
      cancel();
      speak(text, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        onEnd: () => setIsPlaying(prev => ({ ...prev, [idx]: false }))
      });
      setIsPlaying(prev => ({ ...prev, [idx]: true }));
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileUrl } = await response.json();

      const upload = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'Access-Control-Allow-Origin': '*',
        },
        mode: 'cors',
      });

      if (!upload.ok) {
        console.error('Upload failed:', await upload.text());
        throw new Error('Failed to upload file');
      }

      return fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileUrl = await uploadFile(file);
      
      const userMessage: Message = {
        content: `![${file.name}](${fileUrl})`,
        role: "user",
        timestamp: new Date(),
        type: "image",
      };

      setMessages((prev) => [...prev, userMessage]);
      
      const response = await sendChatMessage(
        userMessage.content,
        messages
      );
      
      setMessages((prev) => [...prev, {
        content: response.message,
        role: "assistant",
        timestamp: new Date(),
        type: response.type,
        data: response.data,
      }]);
    } catch (error) {
      console.error('Error handling file:', error);
      toast.error('Failed to process image');
    }
  };

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
              onChange={(e) => {
                const newRate = parseFloat(e.target.value);
                setVoiceSettings(prev => ({ ...prev, rate: newRate }));
                if (messages.length > 0) {
                  speak(messages[messages.length - 1].content, {
                    rate: newRate,
                    pitch: voiceSettings.pitch,
                    volume: voiceSettings.volume
                  });
                }
              }}
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
              onChange={(e) => {
                const newPitch = parseFloat(e.target.value);
                setVoiceSettings(prev => ({ ...prev, pitch: newPitch }));
                if (messages.length > 0) {
                  speak(messages[messages.length - 1].content, {
                    rate: voiceSettings.rate,
                    pitch: newPitch,
                    volume: voiceSettings.volume
                  });
                }
              }}
              className="range range-xs"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Volume</span>
              <span className="label-text-alt">{Math.round(voiceSettings.volume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={voiceSettings.volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVoiceSettings(prev => ({ ...prev, volume: newVolume }));
                if (messages.length > 0) {
                  speak(messages[messages.length - 1].content, {
                    rate: voiceSettings.rate,
                    pitch: voiceSettings.pitch,
                    volume: newVolume
                  });
                }
              }}
              className="range range-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold">Sign in Required</h1>
          <p className="mt-2 text-sm text-gray-600">
            Use your Google account to continue
          </p>
          <button
            onClick={() => signIn()}
            className="btn btn-primary"
          >
            Sign In
          </button>
          <div className="mt-2 text-sm text-gray-600">
            Don&apos;t see the email? Check your spam folder.
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-bold">Function Not Found</h1>
          <p>The function you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <Link href="/functions" className="btn btn-primary">
            Back to Functions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{workflow.name}</h1>
          <p className="text-sm text-gray-500">ID: {workflow.workflow_id}</p>
        </div>
        <Link href="/functions" className="btn btn-ghost">
          Back to Functions
        </Link>
      </div>

      {workflow.description && (
        <div className="mb-8 prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {workflow.description}
          </ReactMarkdown>
        </div>
      )}

      <div className="divider"></div>

      {/* Settings Bar */}
      <div className="flex justify-between items-center mb-4">
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
              <p className="text-sm">Use voice commands, type a message, or send an image</p>
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
                {msg.role === "user" ? session.user?.name || "You" : "Answer"}
                <time className="ml-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </time>
              </div>
              <div
                className={`chat-bubble relative group mt-2 ${
                  msg.role === "user"
                    ? "chat-bubble-primary"
                    : "chat-bubble bg-neutral/20"
                }`}
              >
                {msg.type === "image" ? (
                  <div className="max-w-sm">
                    <Image 
                      src={msg.content.match(/\((.*?)\)/)?.[1] || ''} 
                      alt={msg.content.match(/\[(.*?)\]/)?.[1] || "Uploaded image"}
                      width={300}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    className="prose prose-sm max-w-none"
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
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
          {isSending && (
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
                disabled={isSending || isRecording || isUploading}
              />
              
              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute left-0 -top-6 flex items-center gap-2 text-sm text-error">
                  <span className="inline-block w-2 h-2 bg-error rounded-full animate-pulse"></span>
                  Recording...
                </div>
              )}

              {/* Upload Indicator */}
              {isUploading && (
                <div className="absolute left-0 -top-6 flex items-center gap-2 text-sm text-warning">
                  <span className="loading loading-spinner loading-xs"></span>
                  Uploading...
                </div>
              )}

              {/* Send Button - Positioned inside textarea */}
              <button
                type="submit"
                className="absolute right-2 bottom-2 btn btn-circle btn-sm btn-primary"
                disabled={isSending || (!input.trim() && !isRecording) || isUploading}
              >
                {isSending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <FaPaperPlane className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* File Upload Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost hover:btn-primary btn-circle"
              disabled={isSending || isRecording || isUploading}
              data-tip="Upload image"
            >
              <FaImage className="w-4 h-4" />
            </button>

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
              disabled={isSending || isUploading}
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
      
      <audio ref={audioRef} className="hidden" controls />
    </div>
  );
} 