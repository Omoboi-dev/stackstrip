import React, { useEffect, useRef } from 'react';

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = canvas!.clientWidth || 1280;
      const h = canvas!.clientHeight || 720;
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
    }
    
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;
    const webGL = gl as WebGLRenderingContext;

    const vs = `attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;
    const fs = `precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;

    float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec2 uv = v_texCoord;
        vec3 color1 = vec3(0.043, 0.043, 0.059); // Background #0B0B0F
        vec3 color2 = vec3(0.969, 0.576, 0.102); // Primary #F7931A
        
        float wave = sin(uv.x * 3.0 + u_time * 0.5) * 0.5 + 0.5;
        wave *= cos(uv.y * 2.0 - u_time * 0.3) * 0.5 + 0.5;
        
        vec3 finalColor = mix(color1, color2 * 0.15, wave); // Very subtle glow
        
        // Add some "digital grain"
        float grain = (noise(uv + u_time * 0.01) - 0.5) * 0.02;
        finalColor += grain;

        gl_FragColor = vec4(finalColor, 1.0);
    }`;

    function cs(type: number, src: string) {
      const s = webGL.createShader(type);
      if (!s) return null;
      webGL.shaderSource(s, src);
      webGL.compileShader(s);
      return s;
    }

    const prog = webGL.createProgram();
    if (!prog) return;
    
    const vertexShader = cs(webGL.VERTEX_SHADER, vs);
    const fragmentShader = cs(webGL.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    webGL.attachShader(prog, vertexShader);
    webGL.attachShader(prog, fragmentShader);
    webGL.linkProgram(prog);
    webGL.useProgram(prog);

    const buf = webGL.createBuffer();
    webGL.bindBuffer(webGL.ARRAY_BUFFER, buf);
    webGL.bufferData(webGL.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), webGL.STATIC_DRAW);
    
    const pos = webGL.getAttribLocation(prog, 'a_position');
    webGL.enableVertexAttribArray(pos);
    webGL.vertexAttribPointer(pos, 2, webGL.FLOAT, false, 0, 0);
    
    const uTime = webGL.getUniformLocation(prog, 'u_time');
    const uRes = webGL.getUniformLocation(prog, 'u_resolution');

    let animationFrameId: number;

    function render(t: number) {
      if (!canvas) return;
      if (typeof ResizeObserver === 'undefined') syncSize();
      webGL.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) webGL.uniform1f(uTime, t * 0.001);
      if (uRes) webGL.uniform2f(uRes, canvas.width, canvas.height);
      webGL.drawArrays(webGL.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    
    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 opacity-60">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
