import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, QrCode } from "lucide-react";

interface QRCodeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formTitle: string;
    formUrl: string;
}

export function QRCodeDialog({ open, onOpenChange, formTitle, formUrl }: QRCodeDialogProps) {
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleDownload = () => {
        const canvas = canvasRef.current?.querySelector("canvas");
        if (!canvas) return;

        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        // file name = form title, sanitized
        a.download = `${formTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_qr.png`;
        a.click();
    };

    const handlePrint = () => {
        const canvas = canvasRef.current?.querySelector("canvas");
        if (!canvas) return;

        const dataUrl = canvas.toDataURL("image/png");
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
      <html>
        <head>
          <title>${formTitle} – QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, sans-serif;
              background: #fff;
            }
            h2 { margin-bottom: 4px; font-size: 22px; color: #111; }
            p  { margin-bottom: 20px; font-size: 13px; color: #666; }
            img { width: 240px; height: 240px; }
          </style>
        </head>
        <body>
          <h2>${formTitle}</h2>
          <p>Scan to open this form</p>
          <img src="${dataUrl}" onload="window.focus(); window.print();" />
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[380px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <QrCode className="w-5 h-5 text-primary" />
                        <DialogTitle>QR Code</DialogTitle>
                    </div>
                    <DialogDescription>
                        Share this QR code so anyone can scan and open your form instantly.
                    </DialogDescription>
                </DialogHeader>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-5 py-2">
                    <div
                        ref={canvasRef}
                        className="p-4 bg-white border border-border rounded-xl shadow-sm"
                    >
                        <QRCodeCanvas
                            value={formUrl}
                            size={220}
                            bgColor="#ffffff"
                            fgColor="#111111"
                            level="H"
                            marginSize={1}
                        />
                    </div>

                    <p className="text-xs text-center text-muted-foreground max-w-[280px]">
                        Scanning this code will open: <span className="font-mono text-primary break-all">{formUrl}</span>
                    </p>

                    <div className="flex gap-3 w-full">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handlePrint}
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleDownload}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
