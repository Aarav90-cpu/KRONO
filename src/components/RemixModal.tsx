import React, { useState } from 'react';
import { X, Code, Sparkles, Copy, Check } from 'lucide-react';

interface RemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessFork: (newShaderName: string) => void;
}

export const RemixModal: React.FC<RemixModalProps> = ({
  isOpen,
  onClose,
  onSuccessFork,
}) => {
  const [shaderCode, setShaderCode] = useState(`// Fragment Shader Node
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    float d = length(st - vec2(0.5));
    float wave = sin(d * 24.0 - u_time * 2.0) * 0.5 + 0.5;
    vec3 color = mix(vec3(0.1, 0.8, 0.7), vec3(0.5, 0.4, 0.9), wave);
    gl_FragColor = vec4(color * (1.0 - d * 0.8), 1.0);
}`);

  const [tessellation, setTessellation] = useState(24);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shaderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFork = () => {
    onSuccessFork(`SHADER_FORK_${Date.now().toString().slice(-4)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl bg-surface border border-border-glass-dark p-5 shadow-lg flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-glass-dark">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-on-surface">Fork & Remix Shader</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Code & Preview Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Code Editor */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-outline text-xs">
              <span>GLSL Code</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-on-surface transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              value={shaderCode}
              onChange={(e) => setShaderCode(e.target.value)}
              rows={10}
              className="w-full bg-surface-container-low font-mono text-xs text-on-surface border border-border-glass-dark rounded-lg p-3 focus:outline-none focus:border-primary/50 resize-none"
              spellCheck={false}
            />
          </div>

          {/* Right: Preview & Sliders */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-outline text-xs">
              <span>Preview</span>
              <span className="text-secondary font-mono">120 FPS</span>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden border border-border-glass-dark bg-black">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5BJOp1UWJFutocVw03ynbgHglUyi4WwRooLo7gJ1gWPjia-mn-1biPpIQIofHACTX1GPUQg90xZUlLSXD1WnUX3GuS22FeoJGaAzN44y3Y7F_HpfWQYD8iSdnfpkPWfVVI4zlvCPpoHXM0v4-Ag9gM1I92Vu-gFdTZ4yF0Oa_SRUHuEAQq5KTONRsS3IJ9ZjR-1fUVK6Xfx2EcEOI06FeKVsmT7rft9r4VbbvyuL3306Qk7Py1_5fgg"
                alt="Shader Render"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-3 rounded-lg bg-surface-container-low border border-border-glass-dark flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-on-surface">
                <span>Mesh Density</span>
                <span className="font-mono text-secondary font-semibold">{tessellation}x</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={tessellation}
                onChange={(e) => setTessellation(Number(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container text-[11px] text-outline flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>12% royalty stream locked to parent creator.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-glass-dark">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleFork}
            className="px-4 py-2 rounded-lg bg-primary-container text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Publish Fork</span>
          </button>
        </div>
      </div>
    </div>
  );
};
