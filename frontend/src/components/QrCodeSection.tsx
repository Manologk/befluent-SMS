import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Maximize2, X } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

export function QRCodeSection() {
  const [qrValue] = useState('https://example.com/student-id-12345');
  const [qrSize, setQrSize] = useState(200);

  useEffect(() => {
    const updateSize = () => {
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
      setQrSize(size);
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCode id="qr-code" value={qrValue} size={200} />
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Maximize2 className="w-4 h-4" />
            <span>Quick Scan</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-full max-h-full m-4 p-0 bg-transparent border-none">
          <div className="relative bg-white p-4 rounded-lg shadow-lg">
            <QRCode id="qr-code-zoomed" value={qrValue} size={qrSize} />
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTrigger>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

