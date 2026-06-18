"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Play, Pause, Music, Volume2, VolumeX } from "lucide-react";
import { getAudioTracks } from "../../admin/actions";

export default function SightsAndSoundsPage() {
  const { scrollYProgress } = useScroll();
  const videoParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  const [isMuted, setIsMuted] = useState(true);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isMuted2, setIsMuted2] = useState(true);
  const [isPlayingVideo2, setIsPlayingVideo2] = useState(true);
  const [tracks, setTracks] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  
  // Audio Player State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    async function loadTracks() {
      const data = await getAudioTracks();
      setTracks(data);
    }
    loadTracks();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (videoRef2.current) {
      videoRef2.current.muted = isMuted2;
    }
  }, [isMuted2]);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlayingVideo) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        if (isPlayingVideo2 && videoRef2.current) {
          videoRef2.current.pause();
          setIsPlayingVideo2(false);
        }
      }
      setIsPlayingVideo(!isPlayingVideo);
    }
  };

  const toggleVideoPlay2 = () => {
    if (videoRef2.current) {
      if (isPlayingVideo2) {
        videoRef2.current.pause();
      } else {
        videoRef2.current.play();
        if (isPlayingVideo && videoRef.current) {
          videoRef.current.pause();
          setIsPlayingVideo(false);
        }
      }
      setIsPlayingVideo2(!isPlayingVideo2);
    }
  };

  const handlePlayTrack = (trackId: string, url: string) => {
    if (!url) return; // Ignore if no url
    if (currentTrackId === trackId) {
      // Toggle play/pause on same track
      if (isPlayingAudio) {
        audioRef.current?.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current?.play();
        setIsPlayingAudio(true);
      }
    } else {
      // Play new track
      setCurrentTrackId(trackId);
      setIsPlayingAudio(true);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 lg:px-12 bg-white dark:bg-stone-950 transition-colors duration-1000 overflow-hidden">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlayingAudio(false)} 
        onPause={() => setIsPlayingAudio(false)}
        onPlay={() => setIsPlayingAudio(true)}
      />
      
      <div className="max-w-[1400px] mx-auto w-full flex flex-col">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.2 }}
           className="mb-24"
        >
          <span className="text-[10px] uppercase tracking-[0.5em] text-stone-400 mb-4 block">S/S26 ‘Breath of Fresh Air’ Campaign</span>
          <h1 className="text-5xl md:text-8xl font-serif font-light tracking-tight text-stone-900 dark:text-white uppercase leading-none">
            Sights <br />& <span className="italic text-stone-400 text-6xl md:text-9xl">Sounds</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Featured Video Block */}
          <motion.div 
            style={{ y: videoParallax }} 
            className="lg:col-span-8 flex flex-col gap-16"
          >
            {/* Featured Video Block 1 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="group relative aspect-video bg-stone-900 overflow-hidden rounded-sm cursor-pointer shadow-2xl shrink-0"
            >
              <video 
                ref={videoRef}
                autoPlay 
                muted 
                loop 
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000"
                src="/Home-page-video.mp4"
              />
              <div 
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isPlayingVideo ? 'opacity-0 group-hover:opacity-100' : 'opacity-100 bg-black/20'}`} 
                onClick={toggleVideoPlay}
              >
                <div className="w-20 h-20 rounded-full border border-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  {isPlayingVideo ? (
                    <Pause className="text-white fill-white" size={24} />
                  ) : (
                    <Play className="text-white fill-white ml-1" size={24} />
                  )}
                </div>
              </div>
              <div className="absolute bottom-8 left-8 flex items-center gap-6 z-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-medium">Fleñjure Café Concept: Paris • April 2026</span>
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="absolute bottom-6 right-6 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </motion.div>

            {/* Featured Video Block 2 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="group relative aspect-video bg-stone-900 overflow-hidden rounded-sm cursor-pointer shadow-2xl shrink-0"
            >
              <video 
                ref={videoRef2}
                autoPlay 
                muted 
                loop 
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000"
                src="/SightsSounds-flenjure.mp4"
              />
              <div 
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isPlayingVideo2 ? 'opacity-0 group-hover:opacity-100' : 'opacity-100 bg-black/20'}`} 
                onClick={toggleVideoPlay2}
              >
                <div className="w-20 h-20 rounded-full border border-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  {isPlayingVideo2 ? (
                    <Pause className="text-white fill-white" size={24} />
                  ) : (
                    <Play className="text-white fill-white ml-1" size={24} />
                  )}
                </div>
              </div>
              <div className="absolute bottom-8 left-8 flex items-center gap-6 z-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 font-medium">‘A Breath of Fresh Air’ • June 2025</span>
              </div>
              
              <button
                onClick={(e) => { e.stopPropagation(); setIsMuted2(!isMuted2); }}
                className="absolute bottom-6 right-6 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                aria-label={isMuted2 ? "Unmute" : "Mute"}
              >
                {isMuted2 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </motion.div>
          </motion.div>

          {/* Curated Audio List (Normal Scroll) */}
          <div className="lg:col-span-4 flex flex-col gap-12">
            <div className="flex flex-col gap-8">
              <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-stone-400 border-b border-stone-200 dark:border-stone-800 pb-4">Curated Audio</h3>
              
              {tracks.length > 0 ? (
                tracks.map((track: any) => (
                  <AudioTrack 
                    key={track.id}
                    number={track.track_number} 
                    title={track.title} 
                    length={track.length} 
                    tag={track.platform_tag} 
                    audioUrl={track.audio_url}
                    isPlaying={currentTrackId === track.id && isPlayingAudio}
                    onPlay={() => handlePlayTrack(track.id, track.audio_url)}
                  />
                ))
              ) : (
                <>
                  <AudioTrack number="01" title="Smyrna Jazz Sessions" length="42:15" tag="Spotify" isPlaying={false} onPlay={() => {}} />
                  <AudioTrack number="02" title="Morning Espresso Mix" length="58:00" tag="Apple Music" isPlaying={false} onPlay={() => {}} />
                  <AudioTrack number="03" title="Late Night Essentials" length="1:15:20" tag="Soundcloud" isPlaying={false} onPlay={() => {}} />
                </>
              )}
            </div>

            <div className="p-8 bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800 rounded-sm">
               <Volume2 size={24} strokeWidth={1} className="text-stone-400 mb-6" />
               <p className="text-sm font-light text-stone-600 dark:text-stone-400 leading-relaxed italic">
                 "Our sensory extensions are designed to bridge the gap between the physical and digital, creating an atmosphere that resonates with the Flenjure lifestyle."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AudioTrack({ 
  number, title, length, tag, audioUrl, isPlaying, onPlay 
}: { 
  number: string, title: string, length: string, tag: string, audioUrl?: string, isPlaying: boolean, onPlay: () => void 
}) {
  const isSpotify = audioUrl?.includes('spotify.com');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (isSpotify) {
      setIsExpanded(!isExpanded);
    } else if (audioUrl) {
      onPlay();
    }
  };

  const embedUrl = isSpotify ? audioUrl!.replace('/track/', '/embed/track/').split('?')[0] : '';

  return (
    <div className={`border-b border-stone-100 dark:border-stone-900 pb-6 transition-transform duration-500 ${audioUrl ? 'hover:translate-x-2' : 'opacity-50'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        onClick={handleClick}
        className="flex items-center gap-6 group cursor-pointer"
      >
        <span className="text-[10px] font-mono text-stone-300 dark:text-stone-700">{number}</span>
        <div className="flex-1 flex flex-col gap-1">
          <h4 className={`text-lg font-serif font-light transition-colors uppercase tracking-wider ${isPlaying ? 'text-stone-400' : 'text-stone-900 dark:text-white group-hover:text-stone-400'}`}>
            {title} {isPlaying && !isSpotify && <span className="text-[10px] ml-2 animate-pulse">(Playing)</span>}
          </h4>
          <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-stone-400">
             <span>{length}</span>
             <span className="w-4 h-[1px] bg-stone-200 dark:bg-stone-800" />
             <span>{tag}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full border border-stone-200 dark:border-stone-800 flex items-center justify-center transition-all duration-300 group-hover:border-stone-900 dark:group-hover:border-white group-hover:scale-105 group-hover:bg-stone-50 dark:group-hover:bg-stone-900/30">
          {isSpotify ? (
            <Music size={14} className="text-stone-500 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white" />
          ) : isPlaying ? (
            <Pause size={14} className="text-stone-900 dark:text-white fill-stone-900 dark:fill-white" />
          ) : (
            <Play size={14} className="text-stone-500 dark:text-stone-400 fill-stone-500 dark:fill-stone-400 ml-0.5 group-hover:text-stone-900 dark:group-hover:text-white group-hover:fill-stone-900 dark:group-hover:fill-white" />
          )}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {isExpanded && isSpotify && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-6 pr-6 pl-12"
          >
            <iframe 
              src={embedUrl} 
              width="100%" 
              height="80" 
              frameBorder="0" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
              className="rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 bg-stone-900"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
