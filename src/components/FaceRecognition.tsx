import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, RefreshCw } from 'lucide-react';

interface FaceRecognitionProps {
  onCapture: (image: string) => void;
  isProcessing: boolean;
}

export const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded) {
      startVideo();
    }
  }, [modelsLoaded]);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error(err));
  };

  const handleVideoPlay = () => {
    setInterval(async () => {
      if (videoRef.current) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );
        setFaceDetected(detections.length > 0);
      }
    }, 1000);
  };

  const capture = () => {
    if (videoRef.current && faceDetected) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      onCapture(dataUrl);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-video bg-black rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl">
      {!modelsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-zinc-900">
          <RefreshCw className="w-8 h-8 animate-spin mr-2" />
          <span>Loading Face Models...</span>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        onPlay={handleVideoPlay}
        className="w-full h-full object-cover"
      />
      {faceDetected && (
        <div className="absolute inset-0 border-2 border-emerald-500/50 pointer-events-none animate-pulse" />
      )}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <button
          onClick={capture}
          disabled={!faceDetected || isProcessing}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-lg",
            faceDetected && !isProcessing
              ? "bg-emerald-500 text-white hover:bg-emerald-600 scale-105"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          )}
        >
          <Camera className="w-5 h-5" />
          {isProcessing ? "Processing..." : "Capture Attendance"}
        </button>
      </div>
    </div>
  );
};

import { cn } from '../lib/utils';
