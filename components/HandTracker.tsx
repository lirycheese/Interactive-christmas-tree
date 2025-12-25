
import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store';
import { AppMode, HandGesture } from '../types';

const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setGesture, setMode, mode, setHandRotation, setActivePhotoId, photos } = useStore();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const stateRef = useRef({ mode, photos });

  useEffect(() => {
    stateRef.current = { mode, photos };
  }, [mode, photos]);

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        startWebcam();
      } catch (e) {
        console.error("Failed to load MediaPipe", e);
        setError("AI Load Failed");
      }
    };

    const startWebcam = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user"
            } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.addEventListener('loadeddata', predictWebcam);
            setLoaded(true);
            setError(null);
          }
        } catch (err) {
          console.error("Webcam access denied", err);
          setError("Camera Denied");
        }
      } else {
        setError("No Camera API");
      }
    };

    const drawHandSkeleton = (landmarks: any[]) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Match canvas size to video aspect
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17] // Palm
      ];

      // Draw lines
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 5;
      ctx.setLineDash([]); // Solid line style
      ctx.beginPath();
      
      connections.forEach(([start, end]) => {
        const s = landmarks[start];
        const e = landmarks[end];
        ctx.moveTo(s.x * canvas.width, s.y * canvas.height);
        ctx.lineTo(e.x * canvas.width, e.y * canvas.height);
      });
      ctx.stroke();

      // Draw joints
      ctx.setLineDash([]); // Reset for solid points
      ctx.fillStyle = '#D4AF37';
      landmarks.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a small glow to the point
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#D4AF37';
      });
      ctx.shadowBlur = 0; // Reset shadow
    };

    const predictWebcam = () => {
      if (!handLandmarker || !videoRef.current) return;
      
      const startTimeMs = performance.now();
      if (videoRef.current.videoWidth > 0) {
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
        
        if (results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          analyzeGesture(landmarks);
          drawHandSkeleton(landmarks);
        } else {
          setGesture(HandGesture.NONE);
          // Clear skeleton if no hand
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        }
      }
      animationFrameId = requestAnimationFrame(predictWebcam);
    };

    const analyzeGesture = (landmarks: any[]) => {
      const { mode: currentMode, photos: currentPhotos } = stateRef.current;
      
      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const pinkyTip = landmarks[20];
      const indexBase = landmarks[5];

      const distIndex = Math.sqrt(Math.pow(indexTip.x - wrist.x, 2) + Math.pow(indexTip.y - wrist.y, 2));
      const distPinky = Math.sqrt(Math.pow(pinkyTip.x - wrist.x, 2) + Math.pow(pinkyTip.y - wrist.y, 2));
      const distIndexBase = Math.sqrt(Math.pow(indexBase.x - wrist.x, 2) + Math.pow(indexBase.y - wrist.y, 2));

      // Thresholds for fist and open palm
      const isFist = distIndex < distIndexBase * 1.2 && distPinky < distIndexBase * 1.2;
      const isOpen = distIndex > distIndexBase * 1.6 && distPinky > distIndexBase * 1.6;

      const xPos = 1 - wrist.x; 
      const rotation = (xPos - 0.5) * 4; 
      setHandRotation(rotation);

      if (isFist) {
        setGesture(HandGesture.FIST);
        if (currentMode !== AppMode.FORMED) {
           setMode(AppMode.FORMED);
           setActivePhotoId(null);
        }
      } else if (isOpen) {
        setGesture(HandGesture.OPEN_PALM);
        if (currentMode === AppMode.PHOTO_ZOOM) {
            // Restore photo to tree
            setMode(AppMode.CHAOS);
            setActivePhotoId(null);
        } else if (currentMode === AppMode.FORMED) {
            setMode(AppMode.CHAOS);
        }
      } else {
        const pinchDist = Math.sqrt(Math.pow(indexTip.x - thumbTip.x, 2) + Math.pow(indexTip.y - thumbTip.y, 2));
        // Grab/Pinch to zoom
        if (pinchDist < 0.04) {
            setGesture(HandGesture.PINCH);
            if (currentMode === AppMode.CHAOS && currentPhotos.length > 0) {
                 setMode(AppMode.PHOTO_ZOOM);
                 // Select a random photo to zoom into
                 const randomIndex = Math.floor(Math.random() * currentPhotos.length);
                 setActivePhotoId(currentPhotos[randomIndex].id);
            }
        } else {
            setGesture(HandGesture.NONE);
        }
      }
    };

    setupMediaPipe();

    return () => {
      if (stream) {
         stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrameId);
      if (handLandmarker) handLandmarker.close();
    };
  }, []);

  return (
    <div className={`fixed top-32 md:top-4 right-4 z-[60] w-24 h-18 md:w-48 md:h-36 bg-black/40 border border-[#D4AF37]/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all hover:scale-105 ${error ? 'border-red-500/50' : ''}`}>
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-40" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none" />
      
      <div className="absolute top-1 right-2 flex gap-1 items-center z-10">
          <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[6px] md:text-[8px] text-[#D4AF37] uppercase font-bold tracking-widest">Live Vision</span>
      </div>

      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-[8px] text-[#D4AF37] bg-black/90 text-center p-2 z-20">
          <div className="space-y-1">
            <div className="w-4 h-4 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto"></div>
            <p className="hidden md:block">Engine...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[7px] md:text-[9px] text-red-400 bg-black/90 text-center p-1 z-20">
          <span className="text-xs md:text-sm mb-0.5">⚠️</span>
          <span className="font-bold">{error}</span>
        </div>
      )}
    </div>
  );
};

export default HandTracker;
