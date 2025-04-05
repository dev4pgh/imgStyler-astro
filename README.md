# imgStyler

**[Live Demo](https://imgstyler.app)**

**Simple, Fast, Privacy-Friendly Image Editor for Web**

imgStyler is a minimalistic, intuitive, and entirely browser-based image editor designed to quickly prepare your images for online use. Built specifically to simplify common tasks—cropping, applying filters, adjustments, and exporting—it lets you rapidly enhance and optimize images without complex software or uploads.

## Key Features

### 🚀 Simple, Intuitive Interface
- Quickly crop images using freeform selection or handy social media presets.
- Apply adjustments like brightness, contrast, saturation, hue, sharpness, and more.
- Instantly preview and select from built-in artistic filters such as Vintage, Grayscale, Noir, Sepia, and Sketch.

### 🎯 Optimized for Online Use
- Export in popular formats (PNG, JPEG, WebP, TIFF).
- Customize image quality, resize dimensions, and choose lossless or lossy compression.

### 🔒 Completely Local & Private
- All image processing happens in your web browser using JavaScript.
- No data or images are ever uploaded to a server—your files stay private.

## Getting Started

### Installation

Clone this repository:
```sh
git clone https://github.com/dev4pgh/imgstyler-astro.git
cd imgstyler-astro
npm install
npm run dev
```

Open your browser and navigate to the local URL provided.

### Optional: Setting Up Analytics (Umami)

This project includes integration for [Umami](https://umami.is/), a privacy-focused web analytics solution. Analytics data is only sent if you configure the necessary environment variables.

1.  **Create a `.env` file:** Copy the `.env.example` file to a new file named `.env` in the project root:
    ```bash
    cp .env.example .env
    ```

2.  **Edit `.env`:** Replace the placeholder values in the new `.env` file with your own Umami instance details:
    * `UMAMI_SCRIPT_URL`: The full URL to your Umami `script.js` file (e.g., `https://your-umami-instance.com/script.js`).
    * `UMAMI_WEBSITE_ID`: The unique Website ID provided by your Umami instance for this site.

3.  **Restart Dev Server:** If the development server (`npm run dev`) was already running, stop it (`Ctrl+C`) and restart it to load the new environment variables.

4.  **Deployment:** For analytics to work on your deployed site, you must also configure these same `UMAMI_SCRIPT_URL` and `UMAMI_WEBSITE_ID` environment variables in your hosting provider's settings.


### Usage

1. **Upload an image**: Drag and drop or select a file.
2. **Crop**: Choose presets or custom aspect ratios.
3. **Apply Adjustments & Filters**: Enhance your image to your liking.
4. **Export**: Choose format, quality, and dimensions, then download.

## Technologies Used
- React & Astro for UI components
- Tailwind CSS for styling
- JavaScript Canvas API for image processing

## Privacy First
imgStyler is developed with your privacy in mind—no uploads, and no external dependencies for image processing.

## Contributing
Contributions are welcome! Please submit issues or pull requests to improve functionality or usability.

## License
[MIT License](LICENSE)
---
Developed by [Dev4PGH LLC](https://dev4pgh.com).

