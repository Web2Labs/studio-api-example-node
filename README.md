# Shortcut API Node.js Example

Welcome to the Shortcut API Node.js example! This project demonstrates how to programmatically access Shortcut's video editing automation features using Node.js.

## 🚀 Features

- **Upload Videos**: seamless multipart upload handling using `form-data`.
- **Real-time Progress**: Beautiful CLI progress bar tracking the AI processing stages.
- **Result Retrieval**: Automatically fetches download URLs for your edited video, shorts, and subtitles.

## 📋 Prerequisites

- **Node.js 16+** installed on your machine.
- **API Key**: You need a Web2Labs Shortcut API key.
  - Go to [Web2Labs Shortcut](https://web2labs.com/shortcut)
  - Switch to **API Mode** in the dashboard.
  - Generate your API key.

## 🛠️ Installation

1.  **Clone the repository** (or download these files).

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up your API Key**:
    Create a `.env` file in this directory and add your key:
    ```env
    SHORTCUT_API_KEY=sk_live_YOUR_ACTUAL_API_KEY_HERE
    ```
    *(Alternatively, you can set it as a system environment variable)*

## 🏃 Usage

Run the script with your video file:

```bash
npm start path/to/your/video.mp4
```
Or directly with node:
```bash
node index.js path/to/your/video.mp4
```

### What happens next?

1.  **Upload**: The script uploads your video to the Shortcut secure worker cloud.
2.  **Processing**: You'll see a progress bar as our AI analyzes, cuts, and edits your video.
    ```
    Tracking progress for project proj_abc123...
    Processing |██████░░░░| 60% | Status: Editing | Stage: AI processing...
    ```
3.  **Results**: Once finished, the script prints direct download links for all generated assets.

## 🧩 Code Overview

-   `index.js`: The core script.
    -   `uploadVideo()`: Handles the multipart file upload.
    -   `pollStatus()`: Implements smart polling with rate limit handling.
    -   `getResults()`: Fetches the final asset URLs.

## 🔌 Library Integration

Want to use this in your own existing Node.js script? You can import the `ShortcutClient` class!

1.  Copy `index.js` to your project (you might want to rename it to `ShortcutClient.js`).
2.  Import and use it:

```javascript
const ShortcutClient = require('./ShortcutClient');

// Initialize
const client = new ShortcutClient("YOUR_API_KEY");

async function run() {
    // Upload
    const project = await client.uploadVideo("my_video.mp4");

    // Poll (blocks until done)
    await client.pollStatus(project.projectId);

    // Get Results
    const results = await client.getResults(project.projectId);
    console.log(results.mainVideo.url);
}

run();
```

Check `lib-example.js` for a complete example.

## 📚 API Documentation

For complete API reference, including all available configuration options (like generating shorts, subtitles, or using premium cuts), visit our [Official API Docs](https://web2labs.com/docs/api).

## 🤝 Contributing & Support

Found a bug? Have a feature request?
- **Issues**: Please open an issue in this repository.
- **Pull Requests**: PRs are welcome! Please make sure your code follows the existing style.

---
*Built with ❤️ by Web2Labs*
