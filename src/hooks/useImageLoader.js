import { useState, useEffect, useRef } from "react";
import * as UTIF from "utif";

export function useImageLoader() {
  const [file, setFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentUrlRef = useRef(null);

  useEffect(() => {
    setError(null);
    setOriginalImage(null);
    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }
    if (!file) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const isTiff =
      file.type === "image/tiff" ||
      file.name.toLowerCase().endsWith(".tif") ||
      file.name.toLowerCase().endsWith(".tiff");
    if (!isTiff) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      currentUrlRef.current = url;

      img.onload = () => {
        setOriginalImage(img);
        setIsLoading(false);
      };

      img.onerror = (err) => {
        console.error("Error loading image:", err);
        setError("Failed to load the image. Please try a different file.");
        setOriginalImage(null);
        setIsLoading(false);
        URL.revokeObjectURL(url);
        currentUrlRef.current = null;
      };

      img.src = url;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const ifds = UTIF.decode(arrayBuffer);
          if (!ifds || ifds.length === 0) {
            throw new Error("No image data found in TIFF file.");
          }
          UTIF.decodeImage(arrayBuffer, ifds[0]);
          const width = ifds[0].width;
          const height = ifds[0].height;
          const rgba = UTIF.toRGBA8(ifds[0]);
          if (!width || !height || !rgba) {
            throw new Error("Failed to decode TIFF pixel data.");
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          const imageData = new ImageData(
            new Uint8ClampedArray(rgba),
            width,
            height
          );
          ctx.putImageData(imageData, 0, 0);
          setOriginalImage(canvas);
          setIsLoading(false);
        } catch (decodeError) {
          console.error("Error decoding TIFF:", decodeError);
          setError(`Failed to decode TIFF: ${decodeError.message}`);
          setOriginalImage(null);
          setIsLoading(false);
        }
      };

      reader.onerror = (err) => {
        console.error("Error reading TIFF file:", err);
        setError("Failed to read the selected TIFF file.");
        setOriginalImage(null);
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(file);
    }

    return () => {
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
    };
  }, [file]);

  return {
    file,
    setFile,
    originalImage,
    isLoading,
    error,
  };
}
