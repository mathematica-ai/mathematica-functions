import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { transcribeAudio, translateAudio } from "@/libs/whisper";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as Blob;
    const mode = formData.get('mode') as 'transcribe' | 'translate';
    const optionsStr = formData.get('options') as string;
    
    // Debug log
    console.log('Transcription request:', {
      mode,
      options: optionsStr,
      audioSize: audioFile?.size,
      audioType: audioFile?.type
    });

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        { error: "Invalid audio file" },
        { status: 400 }
      );
    }

    const options = optionsStr ? JSON.parse(optionsStr) : {};

    let text;
    try {
      if (mode === 'translate') {
        text = await translateAudio(audioFile, options);
        console.log('Translation result:', text);
      } else {
        text = await transcribeAudio(audioFile, options);
        console.log('Transcription result:', text);
      }
    } catch (error) {
      console.error('Whisper API Error:', error);
      return NextResponse.json(
        { error: error.message || "Processing failed" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ text });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to process audio" },
      { status: 500 }
    );
  }
} 