
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FirebaseProvider } from './context/FirebaseContext';

// --- STORAGE OPTIMIZATION: Monkey-patch FileReader to compress images on the fly ---
const originalReadAsDataURL = window.FileReader.prototype.readAsDataURL;
window.FileReader.prototype.readAsDataURL = function(file: Blob | File) {
    if (file instanceof File && file.type.startsWith('image/')) {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIM = 600; // Small size to save IndexedDB space
            let { width, height } = img;

            if (width > height && width > MAX_DIM) {
                height *= MAX_DIM / width;
                width = MAX_DIM;
            } else if (height > MAX_DIM) {
                width *= MAX_DIM / height;
                height = MAX_DIM;
            }

            canvas.width = Math.floor(width);
            canvas.height = Math.floor(height);
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Compress as JPEG to save maximum space
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            URL.revokeObjectURL(objectUrl);
            
            // Inject scaled result into reader
            Object.defineProperty(this, 'result', { value: dataUrl, writable: false, configurable: true });
            
            // Trigger load event
            const event = new ProgressEvent('load');
            if (this.onload) this.onload({ target: this } as any);
            this.dispatchEvent(event);
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            originalReadAsDataURL.call(this, file);
        };
        img.src = objectUrl;
    } else {
        originalReadAsDataURL.call(this, file);
    }
};
// -----------------------------------------------------------------------------------

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <FirebaseProvider>
      <App />
    </FirebaseProvider>
  </React.StrictMode>
);
