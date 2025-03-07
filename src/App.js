import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  Container, 
  Box, 
  Typography, 
  IconButton, 
  Paper,
  CircularProgress
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import './App.css';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyCzQC0ZaTWCYUzfxQ69ANfPKPDOtt9aDWU'); // Replace with your API key

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Speech recognition setup
  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognitionRef.current.onend = () => {
      if (isRecording) {
        recognitionRef.current.start();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setTranscript(''); // Clear previous transcript
      setIsRecording(true);
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      processTranscript();
    }
  };

  const processTranscript = async () => {
    if (!transcript.trim()) return;
    
    setIsLoading(true);
    try {
      // Process with Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(transcript);
      const response = await result.response;
      const cleanResponse = response.text().replace(/\*/g, ''); // Remove all asterisks
      setResponse(cleanResponse);
      speakResponse(cleanResponse);
    } catch (error) {
      console.error('Error processing with Gemini:', error);
    }
    setIsLoading(false);
  };

  const speakResponse = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{
          p: 4,
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f5f5'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Voice Chatbot
        </Typography>

        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {transcript && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd' }}>
              <Typography variant="body1">You: {transcript}</Typography>
            </Paper>
          )}
          {response && (
            <Paper sx={{ p: 2, bgcolor: '#f1f8e9' }}>
              <Typography variant="body1">Bot: {response}</Typography>
            </Paper>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              <IconButton 
                color="primary" 
                size="large"
                onClick={isRecording ? stopRecording : startRecording}
                sx={{
                  bgcolor: isRecording ? '#ef5350' : '#4caf50',
                  '&:hover': {
                    bgcolor: isRecording ? '#d32f2f' : '#388e3c',
                  },
                  color: 'white'
                }}
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
              </IconButton>
              {response && (
                <>
                  <IconButton 
                    color="primary" 
                    size="large"
                    onClick={() => isSpeaking ? stopSpeaking() : speakResponse(response)}
                    sx={{
                      bgcolor: '#2196f3',
                      '&:hover': {
                        bgcolor: '#1976d2',
                      },
                      color: 'white'
                    }}
                  >
                    {isSpeaking ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </IconButton>
                </>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default App; 