// src/components/AnnotationCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AnnotationCanvas.css';

/**
 * Simple canvas-based annotator supporting freehand drawing and rectangles.
 * Saves annotation JSON as strokes array + flattened image dataURL.
 */

export default function AnnotationCanvas({ submission, onSaved }) {
  const canvasRef = useRef();
  const imgRef = useRef();
  const [mode, setMode] = useState('pen'); // pen or rect
  const [drawing, setDrawing] = useState(false);
  const [rectStart, setRectStart] = useState(null);
  const [strokes, setStrokes] = useState([]); // array of {type:'pen', points:[] } or {type:'rect', x,y,w,h}
  const { authAxios } = useAuth();

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = submission.imageUrl;
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      // redraw previous strokes if any
      if (submission.annotationData && submission.annotationData.strokes) {
        setStrokes(submission.annotationData.strokes);
        drawAll(ctx, submission.annotationData.strokes, img);
      }
    };
  }, [submission._id]);

  const drawAll = (ctx, list, img) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (img) ctx.drawImage(img, 0, 0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    list.forEach((s) => {
      if (s.type === 'pen') {
        ctx.beginPath();
        const pts = s.points;
        for (let i = 0; i < pts.length; i++) {
          const [x, y] = pts[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = s.color || 'red';
        ctx.lineWidth = s.width || 3;
        ctx.stroke();
      } else if (s.type === 'rect') {
        ctx.strokeStyle = s.color || 'lime';
        ctx.lineWidth = s.width || 2;
        ctx.strokeRect(s.x, s.y, s.w, s.h);
      }
    });
  };

  const start = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (mode === 'pen') {
      setDrawing(true);
      setStrokes((s) => [...s, { type: 'pen', points: [[x, y]], color: 'red', width: 3 }]);
    } else {
      setRectStart([x, y]);
      setDrawing(true);
    }
  };
  const move = (e) => {
    if (!drawing) return;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (mode === 'pen') {
      setStrokes((s) => {
        const last = s[s.length - 1];
        last.points.push([x, y]);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawAll(ctx, s, imgRef.current);
        return [...s.slice(0, s.length - 1), last];
      });
    } else if (mode === 'rect' && rectStart) {
      const [sx, sy] = rectStart;
      const w = x - sx;
      const h = y - sy;
      const tmp = [...strokes.filter((st) => st.type !== 'rect'), ...strokes.filter((st) => st.type === 'rect')];
      // replace last rect if exists
      let newStrokes = strokes.filter((st) => st.type !== 'rect');
      newStrokes.push({ type: 'rect', x: sx, y: sy, w, h, color: 'lime', width: 2 });
      setStrokes(newStrokes);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      drawAll(ctx, newStrokes, imgRef.current);
    }
  };
  const end = (e) => {
    setDrawing(false);
    setRectStart(null);
  };

  const clearAll = () => {
    setStrokes([]);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (imgRef.current) ctx.drawImage(imgRef.current, 0, 0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousedown', start);
      canvas.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('mousedown', start);
        canvas.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', end);
      }
    };
  }, [drawing, mode, rectStart, strokes]);

  const save = async () => {
    // create flattened image
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    try {
      const res = await authAxios.put('/api/submissions/' + submission._id + '/annotate', {
        annotationData: { strokes },
        annotatedImage: dataUrl,
      });
      alert('Annotation saved');
      onSaved && onSaved(res.data);
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="card annotation-container">
      <h4>Annotate: {submission.patientName}</h4>
      <div className="annotation-controls">
        <button className="btn" onClick={() => setMode('pen')}>
          Pen
        </button>
        <button className="btn" onClick={() => setMode('rect')}>
          Rect
        </button>
        <button className="btn" onClick={clearAll}>
          Clear
        </button>
        <button className="btn primary" onClick={save}>
          Save Annotation
        </button>
      </div>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}