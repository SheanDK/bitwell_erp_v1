/* Path: frontend/src/components/QrGenerator.jsx */
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';

export const QrGenerator = ({ value, title }) => {

    const downloadQR = () => {
        const svg = document.getElementById(`qr-${value}`);
        const svgSerializer = new XMLSerializer();
        const svgString = svgSerializer.serializeToString(svg);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });

        const URL = window.URL || window.webkitURL || window;
        const blobURL = URL.createObjectURL(svgBlob);

        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 300;
            canvas.height = 300;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0, 300, 300);

            const png = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = png;
            downloadLink.download = `${title || 'QR-Code'}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };
        image.src = blobURL;
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-slate-800/80 flex flex-col items-center gap-3 w-44">
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase truncate w-full text-center">
                {title}
            </p>

            {/* Real-time Rendering QR Code as SVG */}
            <div className="bg-white p-2 rounded-xl border">
                <QRCodeSVG
                    id={`qr-${value}`}
                    value={value}
                    size={110}
                    level={"H"}
                    includeMargin={true}
                />
            </div>

            {/* Print & Download Button */}
            <button
                onClick={downloadQR}
                className="flex items-center gap-1.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-all w-full justify-center shadow-sm"
            >
                <Download size={12} /> Save PNG
            </button>
        </div>
    );
};