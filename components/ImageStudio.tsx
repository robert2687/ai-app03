
import React, { useState } from 'react';
import { generateImage } from '../services/ai';
import SpinnerIcon from './icons/SpinnerIcon';

const ImageStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [size, setSize] = useState('1K');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aspectRatios = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"];
  const sizes = ["1K", "2K", "4K"];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImage(prompt, aspectRatio, size);
      if (result) {
        setGeneratedImage(result);
      } else {
        setError("No image data returned.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Image Studio</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="md:col-span-1 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Prompt</label>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={4}
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Aspect Ratio</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
              >
                {aspectRatios.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Resolution</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-md transition-colors flex justify-center items-center"
            >
              {isGenerating ? <SpinnerIcon className="w-5 h-5 mr-2" /> : null}
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </button>
            
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          {/* Preview */}
          <div className="md:col-span-2 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center min-h-[400px]">
            {generatedImage ? (
              <img src={generatedImage} alt="Generated" className="max-w-full max-h-full rounded-md shadow-lg" />
            ) : (
              <div className="text-center text-gray-500">
                {isGenerating ? (
                   <div className="flex flex-col items-center">
                     <SpinnerIcon className="w-8 h-8 text-purple-500 mb-2" />
                     <p>Creating your masterpiece...</p>
                   </div>
                ) : (
                    <p>Enter a prompt to generate an image.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
