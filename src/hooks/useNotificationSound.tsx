import { useCallback } from 'react';

export const useNotificationSound = () => {
  const playNotificationSound = useCallback(() => {
    // Create audio context for better browser compatibility
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a pleasant notification tone
    const createTone = (frequency: number, duration: number, delay: number = 0) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          // Create a smooth envelope
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
          
          oscillator.onended = () => resolve();
        }, delay);
      });
    };
    
    // Play a pleasant two-tone notification
    Promise.all([
      createTone(800, 0.3, 0),
      createTone(600, 0.3, 0.15)
    ]).catch(console.error);
  }, []);

  return { playNotificationSound };
};
