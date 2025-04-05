import React, { useState, useRef, useCallback } from "react";

const FileUpload = ({ onFileSelected, children, clickable = true, hideBorder = false }) => {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(true);
    }, []);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!dragActive) {
            setDragActive(true);
        }
    }, [dragActive]);

    const handleDragLeave = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
    }, []);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
        const { files } = event.dataTransfer;
        if (files && files[0]) {
            onFileSelected?.(files[0]);
        }
    }, [onFileSelected]);

    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            onFileSelected?.(file);
        }
    }, [onFileSelected]);

    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const containerClassName = hideBorder
        ? 'relative'
        : `relative border-2 border-dashed border-gray-500 text-center rounded-lg transition-colors p-8 ${dragActive ? 'border-blue-500' : 'border-gray-300'}`;

    return (
        <div
            onClick={clickable ? handleClick : undefined}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={containerClassName}
        >
            {children}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/bmp,image/webp,image/tiff,.tif,.tiff,image/avif"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default FileUpload;