import { create } from 'zustand';
import { AppMode, HandGesture, PhotoData } from './types';

interface AppState {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  
  gesture: HandGesture;
  setGesture: (gesture: HandGesture) => void;

  photos: PhotoData[];
  addPhoto: (photo: PhotoData) => void;
  
  activePhotoId: string | null;
  setActivePhotoId: (id: string | null) => void;

  handRotation: number; // Y-axis rotation based on hand movement
  setHandRotation: (rot: number) => void;
}

export const useStore = create<AppState>((set) => ({
  mode: AppMode.FORMED,
  setMode: (mode) => set({ mode }),

  gesture: HandGesture.NONE,
  setGesture: (gesture) => set({ gesture }),

  photos: [],
  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),

  activePhotoId: null,
  setActivePhotoId: (id) => set({ activePhotoId: id }),

  handRotation: 0,
  setHandRotation: (rot) => set({ handRotation: rot }),
}));
