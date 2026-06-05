// Avatar helpers. Cards are PNGs, so any uploaded image is re-encoded to PNG
// via a canvas so it can carry the embedded tEXt card chunk on export.

export function blobToPngBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 400;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported."));
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((out) => {
        if (!out) return reject(new Error("Failed to encode PNG."));
        out.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load that image."));
    };
    img.src = url;
  });
}

export async function imageFileToPng(file: File): Promise<Uint8Array> {
  return blobToPngBytes(file);
}
