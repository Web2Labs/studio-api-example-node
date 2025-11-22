require('dotenv').config();
const ShortcutClient = require('./index');
const fs = require('fs');

// This example shows how to integrate the Shortcut API into your own scripts
// by importing the ShortcutClient class from index.js

async function processVideoWorkflow(videoPath) {
    // 1. Initialize the client
    const apiKey = process.env.SHORTCUT_API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const client = new ShortcutClient(apiKey);

    console.log(`Starting workflow for: ${videoPath}`);

    // 2. Upload with custom configuration
    // You can pass configuration options like 'shorts', 'subtitle', etc.
    const config = { shorts: true, subtitle: true };
    const project = await client.uploadVideo(videoPath, config);
    console.log(`Project uploaded: ${project.projectId}`);

    // 3. Wait for completion (blocking)
    // Set showProgress=false if running in a background job/cron
    const result = await client.pollStatus(project.projectId, true);

    // 4. Access results programmatically
    if (result.status === 'Completed') {
        const results = await client.getResults(project.projectId);
        return results;
    } else {
        throw new Error("Project failed processing");
    }
}

// Example usage
(async () => {
    try {
        // Create a dummy file for demonstration if needed
        if (!fs.existsSync("test.mp4")) {
            fs.writeFileSync("test.mp4", "dummy content");
        }

        const finalAssets = await processVideoWorkflow("test.mp4");
        console.log("Workflow finished!", finalAssets);

    } catch (error) {
        console.error("Workflow error:", error.message);
    }
})();
