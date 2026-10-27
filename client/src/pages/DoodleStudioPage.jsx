import {
  Download,
  Eraser,
  FolderOpen,
  PaintBucket,
  Palette,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';

// Preset color palette (16 harmonious vibrant & retro pixel colors)
const PALETTE = [
  '#000000',
  '#ffffff',
  '#64748b',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#84cc16',
  '#14b8a6',
  '#d946ef',
];

export const DoodleStudioPage = () => {
  const [gridSize, setGridSize] = useState(16);
  // Color grid represented as array of hex strings or '' for empty
  const [grid, setGrid] = useState(() => Array(16 * 16).fill(''));
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Active Tool: 'pencil' | 'eraser' | 'bucket'
  const [tool, setTool] = useState('pencil');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeDoodleId, setActiveDoodleId] = useState(null);
  const [doodleName, setDoodleName] = useState('My Pixel Artwork');

  // Modals
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [savedDoodles, setSavedDoodles] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [doodleToDelete, setDoodleToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // Handle grid size change
  const handleGridSizeChange = (newSize) => {
    if (newSize === gridSize) return;
    setGridSize(newSize);
    setGrid(Array(newSize * newSize).fill(''));
    setHistory([]);
    setRedoStack([]);
    setActiveDoodleId(null);
  };

  const pushToHistory = (newGrid) => {
    setHistory((prev) => [...prev.slice(-30), [...grid]]); // Cap undo stack to 30
    setRedoStack([]);
    setGrid(newGrid);
  };

  const handleCellAction = (index) => {
    const targetColor = tool === 'eraser' ? '' : selectedColor;

    if (tool === 'bucket') {
      // Flood fill algorithm
      const sourceColor = grid[index];
      if (sourceColor === targetColor) return;

      const newGrid = [...grid];
      const queue = [index];
      const visited = new Set();

      while (queue.length > 0) {
        const curr = queue.pop();
        if (visited.has(curr)) continue;
        visited.add(curr);

        if (newGrid[curr] === sourceColor) {
          newGrid[curr] = targetColor;

          const row = Math.floor(curr / gridSize);
          const col = curr % gridSize;

          // Check neighbors
          if (row > 0) queue.push(curr - gridSize);
          if (row < gridSize - 1) queue.push(curr + gridSize);
          if (col > 0) queue.push(curr - 1);
          if (col < gridSize - 1) queue.push(curr + 1);
        }
      }

      pushToHistory(newGrid);
    } else {
      // Pencil or Eraser single cell
      if (grid[index] === targetColor) return;
      const newGrid = [...grid];
      newGrid[index] = targetColor;
      setGrid(newGrid);
    }
  };

  const handlePointerDown = (index) => {
    setIsDrawing(true);
    setHistory((prev) => [...prev.slice(-30), [...grid]]);
    setRedoStack([]);
    handleCellAction(index);
  };

  const handlePointerEnter = (index) => {
    if (!isDrawing || tool === 'bucket') return;
    const targetColor = tool === 'eraser' ? '' : selectedColor;
    if (grid[index] !== targetColor) {
      const newGrid = [...grid];
      newGrid[index] = targetColor;
      setGrid(newGrid);
    }
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, []);

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [[...grid], ...prev]);
    setGrid(previous);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, [...grid]]);
    setGrid(next);
    setRedoStack((prev) => prev.slice(1));
  };

  const handleClearCanvas = () => {
    setHistory((prev) => [...prev, [...grid]]);
    setRedoStack([]);
    setGrid(Array(gridSize * gridSize).fill(''));
  };

  // Export as Crisp PNG using hidden Offscreen/HTML Canvas
  const handleExportPNG = () => {
    const canvas = document.createElement('canvas');
    const scale = 20; // 20px per pixel art block for high-res crisp download
    canvas.width = gridSize * scale;
    canvas.height = gridSize * scale;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const color = grid[r * gridSize + c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${doodleName.toLowerCase().replace(/\s+/g, '_')}_${gridSize}x${gridSize}.png`;
    link.href = dataUrl;
    link.click();

    setBannerMessage('Artwork exported successfully as high-resolution crisp PNG!');
    setTimeout(() => setBannerMessage(''), 4000);
  };

  // Save / Update to MongoDB
  const handleSaveDoodle = async (e) => {
    e.preventDefault();
    if (!doodleName.trim()) return;
    setSaving(true);
    try {
      if (activeDoodleId) {
        await api.put(`/doodles/${activeDoodleId}`, {
          name: doodleName.trim(),
          gridSize,
          gridData: grid,
        });
        setBannerMessage(`"${doodleName}" updated successfully in cloud!`);
      } else {
        const res = await api.post('/doodles', {
          name: doodleName.trim(),
          gridSize,
          gridData: grid,
        });
        setActiveDoodleId(res.data.data._id);
        setBannerMessage(`"${doodleName}" saved to Doodle Studio gallery!`);
      }
      setSaveModalOpen(false);
      setTimeout(() => setBannerMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving doodle');
    } finally {
      setSaving(false);
    }
  };

  // Load Saved Doodles list
  const fetchSavedDoodles = async () => {
    setLoadingGallery(true);
    try {
      const res = await api.get('/doodles');
      if (res.data.success) {
        setSavedDoodles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load doodles:', err);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleOpenGallery = () => {
    fetchSavedDoodles();
    setGalleryOpen(true);
  };

  const handleLoadDoodle = async (doodle) => {
    try {
      const res = await api.get(`/doodles/${doodle._id}`);
      if (res.data.success) {
        const d = res.data.data;
        setGridSize(d.gridSize);
        setGrid(d.gridData);
        setDoodleName(d.name);
        setActiveDoodleId(d._id);
        setHistory([]);
        setRedoStack([]);
        setGalleryOpen(false);
        setBannerMessage(`Loaded "${d.name}" onto canvas.`);
        setTimeout(() => setBannerMessage(''), 3000);
      }
    } catch (err) {
      alert('Error loading doodle');
    }
  };

  const handleDeleteSavedDoodle = async () => {
    if (!doodleToDelete) return;
    try {
      await api.delete(`/doodles/${doodleToDelete._id}`);
      if (activeDoodleId === doodleToDelete._id) {
        setActiveDoodleId(null);
      }
      fetchSavedDoodles();
    } catch (err) {
      console.error('Failed to delete doodle:', err);
    } finally {
      setDoodleToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Doodle Studio
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Creative Pixel Art
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Take a study break and sketch custom pixel badges, course icons, or retro avatars.
          </p>
        </div>

        {/* Gallery & Save Bar */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleOpenGallery}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-indigo-400" />
            <span>Saved Gallery</span>
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{activeDoodleId ? 'Save (Cloud)' : 'Save Drawing'}</span>
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm flex items-center justify-between animate-fade-in">
          <span>{bannerMessage}</span>
          <button
            onClick={() => setBannerMessage('')}
            className="text-xs text-indigo-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Toolbar & Palette (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Tools & Undo/Redo Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Toolbox & History
            </h3>

            {/* Tool Selection */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTool('pencil')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  tool === 'pencil'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Pencil className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Pencil</span>
              </button>

              <button
                onClick={() => setTool('eraser')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  tool === 'eraser'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Eraser className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Eraser</span>
              </button>

              <button
                onClick={() => setTool('bucket')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                  tool === 'bucket'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <PaintBucket className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Fill</span>
              </button>
            </div>

            {/* Undo, Redo, Clear */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="flex items-center justify-center space-x-1 py-2 px-2 text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 disabled:opacity-40 cursor-pointer"
                title="Undo"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>

              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="flex items-center justify-center space-x-1 py-2 px-2 text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 disabled:opacity-40 cursor-pointer"
                title="Redo"
              >
                <Redo2 className="w-3.5 h-3.5" />
                <span>Redo</span>
              </button>

              <button
                onClick={() => setClearConfirmOpen(true)}
                className="flex items-center justify-center space-x-1 py-2 px-2 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/20 cursor-pointer"
                title="Clear canvas"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Color Palette Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Palette & Colors
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Custom:</span>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                  title="Pick custom hex color"
                />
              </div>
            </div>

            {/* Preset Palette Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              {PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    if (tool === 'eraser') setTool('pencil');
                  }}
                  style={{ backgroundColor: color }}
                  className={`w-full h-8 rounded-lg shadow-sm transition-transform cursor-pointer relative ${
                    selectedColor === color && tool !== 'eraser'
                      ? 'ring-2 ring-indigo-400 scale-105 z-10'
                      : 'hover:scale-105 opacity-90 hover:opacity-100 ring-1 ring-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Active Color Preview */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Current active color:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-slate-300">{selectedColor}</span>
                <div
                  className="w-4 h-4 rounded-md border border-slate-700"
                  style={{ backgroundColor: selectedColor }}
                />
              </div>
            </div>
          </div>

          {/* Grid Size & Export Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Canvas Dimension
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[16, 24, 32].map((sz) => (
                <button
                  key={sz}
                  onClick={() => handleGridSizeChange(sz)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    gridSize === sz
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {sz} × {sz}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleExportPNG}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Crisp PNG</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Pixel Canvas Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-8 shadow-xl">
          <div className="w-full flex items-center justify-between mb-4 px-2">
            <div>
              <span className="text-sm font-bold text-white">{doodleName}</span>
              <span className="text-xs text-slate-500 ml-2">({gridSize}×{gridSize} grid)</span>
            </div>
            <span className="text-xs text-slate-400">Click & Drag to paint</span>
          </div>

          {/* Square Responsive Canvas Wrapper */}
          <div
            className="w-full max-w-[500px] aspect-square bg-[#0b0f19] border-2 border-slate-800 rounded-xl overflow-hidden shadow-2xl p-1 pixel-canvas touch-none"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((cellColor, idx) => (
              <div
                key={idx}
                onPointerDown={() => handlePointerDown(idx)}
                onPointerEnter={() => handlePointerEnter(idx)}
                style={{ backgroundColor: cellColor || '#131826' }}
                className="w-full h-full border border-slate-800/40 cursor-crosshair transition-colors duration-75"
              />
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            Tip: Select the Fill Bucket tool to flood fill regions, or export anytime as a crisp PNG.
          </p>
        </div>
      </div>

      {/* SAVE DOODLE MODAL */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save Drawing to Studio"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveDoodle} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Artwork Title *
            </label>
            <input
              type="text"
              required
              value={doodleName}
              onChange={(e) => setDoodleName(e.target.value)}
              placeholder="e.g. Cyberpunk Campus Avatar"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <p>
              Canvas size: <strong className="text-white">{gridSize} × {gridSize}</strong>
            </p>
            <p>Your artwork is securely synced with your user account in MongoDB.</p>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setSaveModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save to Gallery'}
            </button>
          </div>
        </form>
      </Modal>

      {/* SAVED GALLERY MODAL */}
      <Modal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title="Saved Doodle Gallery"
        maxWidth="max-w-2xl"
      >
        {loadingGallery ? (
          <LoadingSpinner text="Retrieving your drawings..." />
        ) : savedDoodles.length === 0 ? (
          <EmptyState
            icon={Palette}
            title="No saved drawings yet"
            description="Draw something on the canvas and hit 'Save Drawing' to save your artwork here."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
            {savedDoodles.map((d) => (
              <div
                key={d._id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{d.name}</h4>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                    <span>{d.gridSize} × {d.gridSize}</span>
                    <span>•</span>
                    <span>{new Date(d.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLoadDoodle(d)}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => {
                      setDoodleToDelete(d);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete doodle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* CLEAR CANVAS CONFIRMATION */}
      <ConfirmDialog
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={handleClearCanvas}
        title="Clear Canvas"
        message="Are you sure you want to clear all pixels? You can use Undo if this was accidental."
        confirmText="Clear Canvas"
      />

      {/* DELETE DOODLE CONFIRMATION */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteSavedDoodle}
        title="Delete Saved Doodle"
        message={`Are you sure you want to permanently delete "${doodleToDelete?.name}" from your cloud gallery?`}
        confirmText="Delete Doodle"
      />
    </div>
  );
};
