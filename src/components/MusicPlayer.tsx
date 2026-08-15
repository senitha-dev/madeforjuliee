import { useEffect, useRef, useState } from 'react';

// Put your MP3 file at: public/music.mp3
const MUSIC_FILE = '/music.mp3';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(MUSIC_FILE);
    audio.loop = true;
    audio.volume = 0.55;
    audioRef.current = audio;

    const onEnded = () => setPlaying(false);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch (error) {
        console.error('Unable to play music. Add your MP3 as public/music.mp3.', error);
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <button
      id="music-btn"
      className={`music-btn ${playing ? 'playing' : ''}`}
      onClick={toggle}
      title={playing ? 'Pause music' : 'Play music'}
      aria-label={playing ? 'Pause music' : 'Play music'}
    >
      {playing ? '⏸' : '🎵'}
    </button>
  );
}
