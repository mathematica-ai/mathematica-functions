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
    
    // Debug log
    console.log('Audio file details:', {
      size: audioFile.size,
      type: audioFile.type,
      name: (audioFile as any).name
    });

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        { error: "Invalid audio file" },
        { status: 400 }
      );
    }

    const options = JSON.parse(formData.get('options') as string || '{}');
    const mode = formData.get('mode') as 'transcribe' | 'translate' || 'transcribe';

    let text;
    try {
      if (mode === 'translate') {
        text = await translateAudio(audioFile);
      } else {
        text = await transcribeAudio(audioFile, options);
      }
    } catch (error) {
      console.error('Whisper API Error:', error);
      return NextResponse.json(
        { error: error.message || "Transcription failed" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ text });

  } catch (error) {
    console.error("Transcription Error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
} 