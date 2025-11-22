require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const cliProgress = require('cli-progress');

class ShortcutClient {
    constructor(apiKey, baseUrl = 'https://web2labs.com') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'X-API-Key': this.apiKey
            }
        });
    }

    async uploadVideo(filePath, configuration = null) {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        if (configuration) {
            form.append('configuration', typeof configuration === 'string' ? configuration : JSON.stringify(configuration));
        }

        console.log(`Uploading ${filePath}...`);

        try {
            const response = await this.client.post('/api/v1/projects/upload', form, {
                headers: {
                    ...form.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });
            return response.data.data;
        } catch (error) {
            this.handleError('Upload failed', error);
        }
    }

    async pollStatus(projectId, showProgress = true) {
        if (showProgress) {
            console.log(`Tracking progress for project ${projectId}...`);
        }

        let progressBar;
        if (showProgress) {
            progressBar = new cliProgress.SingleBar({
                format: 'Processing |' + '{bar}' + '| {percentage}% | Status: {status} | Stage: {stage}',
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: true
            });
            progressBar.start(100, 0, { status: 'Initializing', stage: 'Starting...' });
        }

        while (true) {
            try {
                const response = await this.client.get(`/api/v1/projects/${projectId}/status`);
                const data = response.data.data;
                const status = data.status;
                const progress = data.progress || {};
                const percentage = progress.percentage || 0;
                const stage = progress.stage || 'Processing';

                if (showProgress && progressBar) {
                    progressBar.update(percentage, { status: status, stage: stage });
                }

                if (status === 'Completed') {
                    if (showProgress && progressBar) {
                        progressBar.update(100, { status: status, stage: 'Done' });
                        progressBar.stop();
                        console.log('\nProcessing completed successfully!');
                    }
                    return data;
                } else if (status === 'Failed') {
                    if (showProgress && progressBar) progressBar.stop();
                    const errorMessage = data.error ? data.error.message : 'Unknown error';
                    throw new Error(`Processing failed: ${errorMessage}`);
                }

                // Wait before next poll (respecting rate limits)
                await new Promise(resolve => setTimeout(resolve, 5000));

            } catch (error) {
                // Don't exit on transient network errors
                // console.error(`\nPolling error: ${error.message}`);
                if (error.message.includes('Processing failed')) throw error;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    async getResults(projectId) {
        try {
            const response = await this.client.get(`/api/v1/projects/${projectId}/results`);
            return response.data.data;
        } catch (error) {
            this.handleError('Failed to get results', error);
        }
    }

    handleError(context, error) {
        const msg = `${context}: ${error.message}`;
        if (error.response) {
            // console.error('Response data:', error.response.data);
            throw new Error(`${msg} - ${JSON.stringify(error.response.data)}`);
        }
        throw new Error(msg);
    }
}

async function main() {
    const API_KEY = process.env.SHORTCUT_API_KEY;
    const BASE_URL = process.env.SHORTCUT_API_URL;
    let VIDEO_FILE_PATH = process.argv[2] || 'example_video.mp4';

    if (!API_KEY) {
        console.error('Error: SHORTCUT_API_KEY environment variable not set.');
        console.error('Please set your API key in a .env file or environment variable.');
        process.exit(1);
    }

    if (!fs.existsSync(VIDEO_FILE_PATH)) {
        console.error(`Error: File not found at ${VIDEO_FILE_PATH}`);
        console.error('Usage: node index.js <path_to_video_file>');
        process.exit(1);
    }

    try {
        const client = new ShortcutClient(API_KEY, BASE_URL);

        // 1. Upload
        const projectData = await client.uploadVideo(VIDEO_FILE_PATH);
        const projectId = projectData.projectId;
        console.log(`Project created: ${projectId}`);

        // 2. Poll
        await client.pollStatus(projectId);

        // 3. Get Results
        const results = await client.getResults(projectId);

        console.log('\n' + '='.repeat(50));
        console.log('RESULTS');
        console.log('='.repeat(50));

        if (results.mainVideo) {
            console.log(`\nMain Video: ${results.mainVideo.url}`);
        }

        if (results.shorts && results.shorts.length > 0) {
            console.log(`\nShorts (${results.shorts.length} generated):`);
            results.shorts.forEach(short => {
                console.log(`- ${short.filename}: ${short.url}`);
            });
        }

        if (results.subtitles) {
            console.log(`\nSubtitles: ${results.subtitles.url}`);
        }

        console.log('\n' + '='.repeat(50));

    } catch (error) {
        console.error('Unexpected error:', error.message);
        process.exit(1);
    }
}

// Export the class
module.exports = ShortcutClient;

// Run main if called directly
if (require.main === module) {
    main();
}
