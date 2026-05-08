import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, ExternalLink } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Factory that returns a fresh jsPDF doc — called when the dialog opens. */
  buildDoc: () => import("jspdf").jsPDF | null;
  /** Filename (without extension) used for the download. */
  filename: string;
}

/**
 * Lightweight PDF preview: renders the generated PDF in an embedded iframe
 * so the clinician can review before exporting / opening externally.
 */
export function PdfPreviewDialog({ open, onOpenChange, title, buildDoc, filename }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [doc, setDoc] = useState<import("jspdf").jsPDF | null>(null);

  useEffect(() => {
    if (!open) return;
    const d = buildDoc();
    if (!d) return;
    const blob = d.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    setDoc(d);
    setUrl(blobUrl);
    return () => {
      URL.revokeObjectURL(blobUrl);
      setUrl(null);
      setDoc(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const download = () => {
    if (!doc) return;
    doc.save(`${filename}.pdf`);
  };

  const openExternal = () => {
    if (!url) return;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[92vw] h-[88vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-5 py-3 border-b border-border flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
          <div className="flex items-center gap-2 mr-6">
            <button
              onClick={openExternal}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-background transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
            </button>
            <button
              onClick={download}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </button>
          </div>
        </DialogHeader>
        <div className="flex-1 bg-muted/30">
          {url ? (
            <iframe
              src={url}
              title={title}
              className="w-full h-full border-0"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Generating preview…
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
