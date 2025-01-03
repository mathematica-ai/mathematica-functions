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
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');
  
  // Add optional parameters with defaults
  formData.append('language', options.language || 'en');
  formData.append('prompt', options.prompt || 'This is a conversation about AI and technology');
  formData.append('temperature', (options.temperature || 0.3).toString());
  formData.append('response_format', options.response_format || 'json');

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
export async function translateAudio(
  audioBlob: Blob,
  options: Omit<WhisperOptions, 'language'> = {}
): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');
  formData.append('response_format', options.response_format || 'json');
  formData.append('prompt', options.prompt || 'This is a conversation about AI and technology');
  formData.append('temperature', (options.temperature || 0.3).toString());

  try {
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

    if (response.data?.text) {
      return response.data.text;
    } else {
      throw new Error('No translation received');
    }
  } catch (error) {
    console.error('Whisper Translation API Error:', error.response?.data || error);
    throw error;
  }
} 