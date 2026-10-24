// Moonshine (Local): runs Moonshine speech-to-text fully in the browser via transformers.js.
// Audio never leaves the device. The model is downloaded on first use and cached by the browser.
import { escapeHtml } from '../../../utils.js';
export { MoonshineLocalSttProvider };

const DEBUG_PREFIX = '<Speech Recognition module (Moonshine Local)> ';
const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.0/dist/transformers.min.js';
const TARGET_SAMPLE_RATE = 16000;

// Cached across calls so the model loads once per page.
let transcriberPromise = null;
let loadedModelId = null;

class MoonshineLocalSttProvider {
    settings;

    defaultSettings = {
        language: '',
        model: 'UsefulSensors/moonshine-streaming-tiny',
    };

    modelOptions = [
        { value: 'UsefulSensors/moonshine-streaming-tiny', label: 'Moonshine Tiny Streaming (34M, English)' },
    ];

    get settingsHtml() {
        const options = this.modelOptions
            .map(opt => `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`)
            .join('\n');

        return `
        <div class="flex-container flexFlowColumn">
            <b>Runs in your browser. English only. The model downloads on first use.</b>
            <label for="moonshine_local_model">Moonshine model</label>
            <select id="moonshine_local_model">
                ${options}
            </select>
            <div><i>If the model fails to load, your browser cannot run this model format yet. Try again after the model is available as ONNX.</i></div>
        </div>
        `;
    }

    onSettingsChange() {
        this.settings.model = String($('#moonshine_local_model').val());
        console.debug(DEBUG_PREFIX + 'Updated settings: ', this.settings);
    }

    loadSettings(settings) {
        if (Object.keys(settings).length === 0) {
            console.debug(DEBUG_PREFIX + 'Using default Moonshine (Local) STT extension settings');
        }

        // Only accept keys defined in defaultSettings
        this.settings = { ...this.defaultSettings };
        for (const key in settings) {
            if (key in this.settings) {
                this.settings[key] = settings[key];
            } else {
                throw `Invalid setting passed to STT extension: ${key}`;
            }
        }

        $('#speech_recognition_language').val(this.settings.language);
        $('#moonshine_local_model').val(this.settings.model);
        console.debug(DEBUG_PREFIX + 'Moonshine (Local) STT settings loaded');
    }

    async processAudio(audioBlob) {
        const modelId = this.settings.model || this.defaultSettings.model;
        try {
            const transcriber = await getTranscriber(modelId);
            const samples = await decodeToMono16k(audioBlob);
            const output = await transcriber(samples);
            return String(output?.text ?? '').trim();
        } catch (error) {
            // Drop the cached pipeline so a later attempt can retry the load.
            transcriberPromise = null;
            loadedModelId = null;
            toastr.error(String(error?.message ?? error), 'STT Generation Failed (Moonshine Local)', { timeOut: 10000, extendedTimeOut: 20000, preventDuplicates: true });
            throw error;
        }
    }
}

/**
 * Load (or reuse) the transformers.js ASR pipeline for the given model.
 * @param {string} modelId
 */
async function getTranscriber(modelId) {
    if (transcriberPromise && loadedModelId === modelId) {
        return transcriberPromise;
    }

    loadedModelId = modelId;
    transcriberPromise = (async () => {
        const { pipeline } = await import(TRANSFORMERS_URL);
        console.debug(DEBUG_PREFIX + 'Loading model', modelId);
        return pipeline('automatic-speech-recognition', modelId, { device: 'wasm' });
    })();

    return transcriberPromise;
}

/**
 * Decode a WAV/webm blob and resample it to 16 kHz mono Float32, which Moonshine expects.
 * @param {Blob} blob
 * @returns {Promise<Float32Array>}
 */
async function decodeToMono16k(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const decodeContext = new AudioContext();
    let decoded;
    try {
        decoded = await decodeContext.decodeAudioData(arrayBuffer);
    } finally {
        decodeContext.close();
    }

    const frameCount = Math.ceil(decoded.duration * TARGET_SAMPLE_RATE);
    const offline = new OfflineAudioContext(1, Math.max(1, frameCount), TARGET_SAMPLE_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();

    return rendered.getChannelData(0).slice();
}
