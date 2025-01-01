import axios from 'axios';

interface WhisperOptions {
  language?: string;       // Optional: Specify input language (e.g., "en", "es", "fr")
  prompt?: string;         // Optional: Initial prompt to guide transcription
  temperature?: number;    // Optional: Model temperature (0-1)
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'; // Output format
}

export async function transcribeAudio(
  audioBlob: Blob, 
  options: WhisperOptions = {}
): Promise<string> {
  // Convert webm to mp3 if needed (Whisper accepts mp3)
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');
  
  // Add optional parameters
  if (options.language) formData.append('language', options.language);
  if (options.prompt) formData.append('prompt', options.prompt);
  if (options.temperature) formData.append('temperature', options.temperature.toString());
  if (options.response_format) formData.append('response_format', options.response_format);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions', 
      formData, 
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data?.text) {
      return response.data.text;
    } else {
      throw new Error('No transcription received');
    }
  } catch (error) {
    console.error('Whisper API Error:', error.response?.data || error);
    throw error;
  }
}

// Translation function - converts audio to English
export async function translateAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'json');

  const response = await axios.post(
    'https://api.openai.com/v1/audio/translations',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.text;
} 