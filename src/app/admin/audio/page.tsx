"use client";

import { useEffect, useState } from "react";
import { getAudioTracks, createAudioTrack, updateAudioTrack, deleteAudioTrack, getAudioUploadToken } from "../actions";
import { Plus, Trash2, Loader2, Music, UploadCloud } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { supabase } from "@/lib/supabase";

interface AudioTrack {
  id: string;
  title: string;
  length: string;
  platform_tag: string;
  track_number: string;
  audio_url: string;
}

export default function AdminAudioPage() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list');
  const [editingTrack, setEditingTrack] = useState<AudioTrack | null>(null);
  
  const [title, setTitle] = useState("");
  const [length, setLength] = useState("");
  const [platformTag, setPlatformTag] = useState("");
  const [trackNumber, setTrackNumber] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean; title: string; message: string; onConfirm: () => void}>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { token, path, publicUrl } = await getAudioUploadToken(file.name);
      
      const { data, error } = await supabase.storage.from("audio").uploadToSignedUrl(path, token, file);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setAudioUrl(publicUrl);
    } catch (error) {
      console.error(error);
      alert("Failed to upload audio file. Ensure the 'audio' bucket is created and public in Supabase.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      const data = await getAudioTracks();
      if (data) setTracks(data as AudioTrack[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const openCreateView = () => {
    setEditingTrack(null);
    setTitle(""); setLength(""); setPlatformTag(""); setTrackNumber(""); setAudioUrl("");
    setCurrentView('edit');
  };

  const openEditView = (track: AudioTrack) => {
    setEditingTrack(track);
    setTitle(track.title); setLength(track.length); setPlatformTag(track.platform_tag); setTrackNumber(track.track_number); setAudioUrl(track.audio_url || "");
    setCurrentView('edit');
  };

  const closeView = () => {
    setCurrentView('list');
  };

  const requestDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Delete Track",
      message: "Are you sure you want to delete this track?",
      onConfirm: () => handleDelete(id)
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAudioTrack(id);
      setTracks(tracks.filter(t => t.id !== id));
      if (editingTrack?.id === id) closeView();
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete track");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const newTrack = {
      title, length, platform_tag: platformTag, track_number: trackNumber, audio_url: audioUrl
    };

    try {
      if (editingTrack) {
        const res = await updateAudioTrack(editingTrack.id, newTrack);
        if (res && 'error' in res) {
          if (res.message && res.message.includes("audio_url")) {
            alert(`Database error: ${res.message}\n\nPlease run this SQL command in your Supabase SQL Editor:\n\nALTER TABLE audio_tracks ADD COLUMN IF NOT EXISTS audio_url TEXT;`);
          } else {
            alert(`Failed to update track: ${res.message}`);
          }
          setSaving(false);
          return;
        }
      } else {
        const res = await createAudioTrack(newTrack);
        if (res && res.error === 'TABLE_MISSING') {
          alert(`Table is missing in Supabase.\n\nPlease go to your Supabase SQL Editor and run this exactly:\n\nCREATE TABLE audio_tracks (\n  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n  title TEXT NOT NULL,\n  length TEXT NOT NULL,\n  platform_tag TEXT NOT NULL,\n  track_number TEXT NOT NULL,\n  audio_url TEXT\n);`);
          setSaving(false);
          return;
        } else if (res && res.error) {
          if (res.message && res.message.includes("audio_url")) {
            alert(`Database error: ${res.message}\n\nPlease run this SQL command in your Supabase SQL Editor:\n\nALTER TABLE audio_tracks ADD COLUMN IF NOT EXISTS audio_url TEXT;`);
          } else {
            alert(`Failed to save track: ${res.message}`);
          }
          setSaving(false);
          return;
        }
      }
      const data = await getAudioTracks();
      setTracks(data as AudioTrack[]);
      closeView();
    } catch (err) {
      console.error(err);
      alert("Failed to save track");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-white flex items-center gap-2">
              <Music size={24} /> Curated Audio
            </h1>
            <p className="text-sm text-stone-500 mt-1">Manage tracks for the Sights & Sounds page</p>
          </div>
          {currentView === 'list' ? (
            <button 
              onClick={openCreateView}
              className="bg-stone-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus size={16} /> Add Track
            </button>
          ) : (
            <button 
              onClick={closeView}
              className="border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {currentView === 'list' && (
          <div className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-xl overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20">
                  <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Track #</th>
                  <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Title</th>
                  <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Length</th>
                  <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase">Platform</th>
                  <th className="py-3 px-4 text-xs font-medium text-stone-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map(track => (
                  <tr key={track.id} className="border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors group cursor-pointer" onClick={() => openEditView(track)}>
                    <td className="py-4 px-4 font-mono text-sm text-stone-900 dark:text-white">{track.track_number}</td>
                    <td className="py-4 px-4 font-medium text-sm text-stone-900 dark:text-white">{track.title}</td>
                    <td className="py-4 px-4 text-sm text-stone-500">{track.length}</td>
                    <td className="py-4 px-4 text-sm text-stone-500">{track.platform_tag}</td>
                    <td className="py-4 px-4 text-right">
                       <button onClick={(e) => { e.stopPropagation(); requestDelete(track.id); }} className="text-stone-400 hover:text-red-500 p-2">
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
                {tracks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-stone-500 text-sm">No tracks found.</p>
                        <button 
                          onClick={async () => {
                            setLoading(true);
                            // Simple auto-seed
                            const defaultTracks = [
                              { track_number: "01", title: "Smyrna Jazz Sessions", length: "42:15", platform_tag: "Spotify" },
                              { track_number: "02", title: "Morning Espresso Mix", length: "58:00", platform_tag: "Apple Music" },
                              { track_number: "03", title: "Late Night Essentials", length: "1:15:20", platform_tag: "Soundcloud" }
                            ];
                            for (const track of defaultTracks) {
                              const res = await createAudioTrack(track);
                              if (res && res.error === 'TABLE_MISSING') {
                                alert(`Table is missing in Supabase.\n\nPlease go to your Supabase SQL Editor and run this exactly:\n\nCREATE TABLE audio_tracks (\n  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),\n  title TEXT NOT NULL,\n  length TEXT NOT NULL,\n  platform_tag TEXT NOT NULL,\n  track_number TEXT NOT NULL,\n  audio_url TEXT\n);`);
                                setLoading(false);
                                return;
                              }
                            }
                            const data = await getAudioTracks();
                            setTracks(data as AudioTrack[]);
                            setLoading(false);
                          }}
                          className="bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
                        >
                          Seed Default Data
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {currentView === 'edit' && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <h3 className="text-lg font-medium text-stone-900 dark:text-white">
              {editingTrack ? 'Edit Track' : 'New Track'}
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Track Number (e.g. 01)</label>
                <input
                  type="text" required
                  value={trackNumber} onChange={e => setTrackNumber(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-700 bg-transparent rounded-lg px-4 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Title</label>
                <input
                  type="text" required
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-700 bg-transparent rounded-lg px-4 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Length (e.g. 42:15)</label>
                <input
                  type="text" required
                  value={length} onChange={e => setLength(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-700 bg-transparent rounded-lg px-4 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Platform (e.g. Spotify)</label>
                <input
                  type="text" required
                  value={platformTag} onChange={e => setPlatformTag(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-700 bg-transparent rounded-lg px-4 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Audio File or URL</label>
                <div className="flex gap-4">
                  <input
                    type="url"
                    value={audioUrl} onChange={e => setAudioUrl(e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                    className="flex-1 border border-stone-200 dark:border-stone-700 bg-transparent rounded-lg px-4 py-2 text-sm outline-none focus:border-stone-900 dark:focus:border-stone-500"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors h-full"
                    >
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                      {uploading ? "Uploading..." : "Upload File"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100 dark:border-stone-800">
              <button 
                type="button" onClick={closeView}
                className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" disabled={saving}
                className="bg-stone-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save Track
              </button>
            </div>
          </form>
        )}
      </div>
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
}
