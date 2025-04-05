export const FORMAT_OPTIONS = [
  {
    label: "PNG (Lossless)",
    value: "image/png",
    lossy: false,
    supportsLossless: false,
  },
  {
    label: "JPEG (Lossy)",
    value: "image/jpeg",
    lossy: true,
    supportsLossless: false,
  },
  { label: "WebP", value: "image/webp", lossy: true, supportsLossless: true },
  {
    label: "TIFF (Lossless)",
    value: "image/tiff",
    lossy: false,
    supportsLossless: false,
  },
];
