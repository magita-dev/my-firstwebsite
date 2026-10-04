import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Wand2, 
  X, 
  ChevronUp, 
  ChevronDown,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HolidayMusicPlayerProps {
  autoPlayTriggered?: boolean;
}

export const HolidayMusicPlayer: React.FC<HolidayMusicPlayerProps> = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.65);
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string>("Justin Bieber – Mistletoe (Holiday Acoustic)");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // AI Lyria Generation state
  const [aiPrompt, setAiPrompt] = useState<string>(
    "Acoustic pop holiday track inspired by Mistletoe by Justin Bieber with warm acoustic guitar strumming, cheerful sleigh bells, romantic upbeat melodies, and festive holiday warmth"
  );
  const [selectedModel, setSelectedModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string>('');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

  // Web Audio Context refs for synthetic Mistletoe audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Web Audio Engine for Mistletoe Acoustic Progression
  const startMistletoeSynth = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Chord Frequencies (Key of D: D, A, Bm, G)
      // Standard tuning guitar notes for Justin Bieber's Mistletoe
      const chordProgression = [
        // D Major: D3 (146.83), A3 (220.0), D4 (293.66), F#4 (369.99)
        { bass: 146.83, notes: [220.0, 293.66, 369.99, 440.0] },
        // A Major: A2 (110.0), E3 (164.81), A3 (220.0), C#4 (277.18)
        { bass: 110.0, notes: [164.81, 220.0, 277.18, 329.63] },
        // B Minor: B2 (123.47), F#3 (185.0), B3 (246.94), D4 (293.66)
        { bass: 123.47, notes: [185.0, 246.94, 293.66, 369.99] },
        // G Major: G2 (98.0), D3 (146.83), G3 (196.0), B3 (246.94)
        { bass: 98.0, notes: [146.83, 196.0, 246.94, 293.66] }
      ];

      let chordIndex = 0;
      let beat = 0;

      const scheduleLoop = () => {
        if (!isPlayingRef.current || !audioCtxRef.current) return;
        const now = audioCtxRef.current.currentTime;
        const currentChord = chordProgression[chordIndex];

        // 1. Play Bass Note (on beat 0 and 2)
        if (beat === 0 || beat === 2) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(currentChord.bass, now);

          bassGain.gain.setValueAtTime(0.4, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

          bassOsc.connect(bassGain);
          bassGain.connect(masterGain);

          bassOsc.start(now);
          bassOsc.stop(now + 0.6);
        }

        // 2. Play Strummed Acoustic Notes (arpeggiated on beat 1, 2, 3)
        currentChord.notes.forEach((freq, idx) => {
          const strumDelay = idx * 0.035;
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'sine'; // warm acoustic nylon feel
          osc.frequency.setValueAtTime(freq, now + strumDelay);

          noteGain.gain.setValueAtTime(0.2, now + strumDelay);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + strumDelay + 0.45);

          osc.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(now + strumDelay);
          osc.stop(now + strumDelay + 0.5);
        });

        // 3. Play Festive Sleigh Bell Shimmer (High frequency cluster)
        if (beat % 2 === 1) {
          [2800, 3400, 4200, 5600].forEach(bellFreq => {
            const bellOsc = ctx.createOscillator();
            const bellGain = ctx.createGain();
            bellOsc.type = 'sine';
            bellOsc.frequency.setValueAtTime(bellFreq, now);

            bellGain.gain.setValueAtTime(0.035, now);
            bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

            bellOsc.connect(bellGain);
            bellGain.connect(masterGain);

            bellOsc.start(now);
            bellOsc.stop(now + 0.2);
          });
        }

        beat = (beat + 1) % 4;
        if (beat === 0) {
          chordIndex = (chordIndex + 1) % chordProgression.length;
        }

        // 82 BPM => ~365ms per beat
        timerRef.current = window.setTimeout(scheduleLoop, 365);
      };

      isPlayingRef.current = true;
      setIsPlaying(true);
      scheduleLoop();
    } catch (e) {
      console.warn('Audio synthesis initialization notice', e);
    }
  };

  const stopMistletoeSynth = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Toggle playback
  const handleTogglePlay = () => {
    if (generatedAudioUrl && audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (isPlaying) {
      stopMistletoeSynth();
    } else {
      startMistletoeSynth();
    }
  };

  // Handle Volume change
  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (newVal === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }

    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        newVal === 0 || isMuted ? 0 : newVal * 0.4, 
        audioCtxRef.current.currentTime
      );
    }
    if (audioElementRef.current) {
      audioElementRef.current.volume = newVal;
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        nextMuted ? 0 : volume * 0.4, 
        audioCtxRef.current.currentTime
      );
    }
    if (audioElementRef.current) {
      audioElementRef.current.muted = nextMuted;
    }
  };

  // Call Lyria Music Generation API
  const handleGenerateAiMusic = async () => {
    setIsGenerating(true);
    setGenerationError('');

    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          model: selectedModel
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to generate music track with Lyria');
      }

      if (data.audioBase64) {
        // Stop current synth
        stopMistletoeSynth();

        // Convert base64 to Blob URL
        const byteCharacters = atob(data.audioBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
        const url = URL.createObjectURL(blob);

        setGeneratedAudioUrl(url);
        setCurrentTrackTitle(`Lyria AI: ${aiPrompt.slice(0, 32)}...`);
        setShowAiModal(false);

        // Auto play generated track
        setTimeout(() => {
          if (audioElementRef.current) {
            audioElementRef.current.src = url;
            audioElementRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }, 100);
      }
    } catch (err: any) {
      setGenerationError(err?.message || 'Error communicating with Lyria model. Check GEMINI_API_KEY in Secrets.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <>
      {/* Hidden audio element for generated Lyria tracks */}
      <audio 
        ref={audioElementRef} 
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Floating Holiday Music Player Bar */}
      <div 
        className={`fixed bottom-4 left-4 z-40 transition-all duration-300 ${
          isMinimized ? 'w-auto' : 'w-11/12 sm:w-96'
        }`}
      >
        <div className="glass-panel rounded-2xl border border-[#D4AF37]/50 shadow-2xl p-3 sm:p-3.5 bg-[#0B132B]/95 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Music Note Icon with Bouncing Visualizer */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleTogglePlay}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[#0B132B] font-bold shadow-md transition-all active:scale-95 ${
                  isPlaying 
                    ? 'bg-gradient-to-r from-[#F3E5AB] to-[#D4AF37] ring-2 ring-[#D4AF37]/40' 
                    : 'bg-[#D4AF37] hover:bg-[#E5C158]'
                }`}
                title={isPlaying ? 'Pause Mistletoe' : 'Play Mistletoe (Justin Bieber)'}
                aria-label="Play or Pause Holiday Music"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {!isMinimized && (
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
                      Holiday Mistletoe Radio
                    </span>
                  </div>
                  <p className="text-xs font-serif font-bold text-white truncate max-w-[170px] sm:max-w-[190px]">
                    {currentTrackTitle}
                  </p>
                </div>
              )}
            </div>

            {/* Middle: Dancing visualizer bars when playing */}
            {!isMinimized && isPlaying && (
              <div className="flex items-end gap-0.5 h-4 px-1" aria-hidden="true">
                <span className="w-1 bg-[#D4AF37] rounded-full animate-bounce h-3" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 bg-[#9E2A2B] rounded-full animate-bounce h-4" style={{ animationDelay: '0.3s' }} />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: '0.2s' }} />
                <span className="w-1 bg-[#F3E5AB] rounded-full animate-bounce h-3.5" style={{ animationDelay: '0.4s' }} />
              </div>
            )}

            {/* Right: Controls & Lyria AI Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!isMinimized && (
                <>
                  {/* Volume / Mute button */}
                  <button
                    onClick={handleToggleMute}
                    className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                    aria-label="Toggle Mute"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* AI Lyria Music Studio Trigger */}
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="p-1.5 text-[#F3E5AB] bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                    title="Generate Music with Lyria AI"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="hidden sm:inline">AI Studio</span>
                  </button>
                </>
              )}

              {/* Minimize / Expand Toggle */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                title={isMinimized ? 'Expand Music Player' : 'Minimize'}
                aria-label="Toggle player size"
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

          </div>

          {/* Volume Slider row when expanded */}
          {!isMinimized && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <Music className="w-3 h-3 text-[#D4AF37]" />
                <span>Justin Bieber - Mistletoe Mix</span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px]">Vol:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1 accent-[#D4AF37] bg-slate-700 rounded-lg cursor-pointer"
                  aria-label="Volume slider"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: AI Holiday Music Generator with Lyria */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0B132B] border border-[#D4AF37]/50 rounded-2xl shadow-2xl p-6 space-y-5">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wand2 className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs uppercase font-bold tracking-wider text-[#D4AF37]">
                    Lyria Music Engine
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white">
                  Generate Holiday Music with AI
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Create original festive pop, acoustic carols, or orchestral tracks using Lyria 3
                </p>
              </div>

              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-2">
                Select Model
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedModel('lyria-3-clip-preview')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedModel === 'lyria-3-clip-preview'
                      ? 'bg-[#1C2541] border-[#D4AF37] text-white shadow-md'
                      : 'bg-[#0B132B]/60 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Lyria Clip</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">30-second preview clip</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedModel('lyria-3-pro-preview')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedModel === 'lyria-3-pro-preview'
                      ? 'bg-[#1C2541] border-[#D4AF37] text-white shadow-md'
                      : 'bg-[#0B132B]/60 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-xs text-white">Lyria Pro</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">Full-length holiday track</div>
                </button>
              </div>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1.5">
                Music Prompt & Style
              </label>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your holiday track (instruments, mood, tempo)..."
                className="w-full bg-[#1C2541] border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            {/* Prompt Quick Presets */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5">
                Or try a popular holiday prompt:
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAiPrompt("Acoustic pop holiday track inspired by Mistletoe by Justin Bieber with warm acoustic guitar, sleigh bells, and romantic festive vocals")}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                >
                  Mistletoe Acoustic Pop
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt("Times Square New Year's Eve Broadway brass overture with upbeat big band jazz, drums, and festive triumph")}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                >
                  Times Square Big Band
                </button>
                <button
                  type="button"
                  onClick={() => setAiPrompt("Gentle snowfall in Central Park piano and cello lullaby with soft warm strings")}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10"
                >
                  Central Park Snow Piano
                </button>
              </div>
            </div>

            {/* Error Display */}
            {generationError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{generationError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAiMusic}
                disabled={isGenerating || !aiPrompt.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-[#0B132B] bg-gradient-to-r from-[#F3E5AB] to-[#D4AF37] hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Track...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate Music ({selectedModel === 'lyria-3-clip-preview' ? 'Clip' : 'Pro'})</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
