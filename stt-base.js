import { getRequestHeaders } from '../../../../script.js';
import { escapeHtml } from '../../../utils.js';
import { secret_state } from '../../../secrets.js';

/**
 * Base class for STT (Speech-to-Text) providers that use OpenAI-compatible APIs.
 * Subclasses should define the provider-specific properties in their constructor.
 */
export class SttBaseProvider {
    settings;

    /**
     * Default settings for this provider. Subclasses should override.
     * @type {{ language: string, model: string }}
     */
    defaultSettings = {
        language: '',
        model: '',
    };

    /**
     * Provider name used for debug messages and error toasts.
     * @type {string}
     */
    providerName = 'Base';

    /**
     * The API endpoint path for transcription.
     * @type {string}
     */
    apiEndpoint = '';

    /**
     * HTML element ID prefix for this provider's settings.
     * @type {string}
     */
    idPrefix = 'base_stt';

    /**
     * Additional note to be displayed in the settings.
     */
    providerNote = '';

    /**
     * Available model options for the settings dropdown.
     * Each entry should have a 'value' and 'label' property.
     * @type {Array<{ value: string, label: string }>}
     */
    modelOptions = [];

    /**
     * Secret key that is required to use the provider.
     * Requests will fail if it's not provided.
     */
    secretKey = '';

    /**
     * Debug prefix for console logging.
     * @returns {string}
     */
    get debugPrefix() {
        return `<Speech Recognition module (${this.providerName})> `;
    }

    /**
     * HTML for provider-specific settings UI.
     * @returns {string}
     */
    get settingsHtml() {
        const options = this.modelOptions
            .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
            .join('\n                ');

        return `
        <div class="flex-container flexFlowColumn">
            <b>${escapeHtml(this.providerNote)}</b>
            <label for="${this.idPrefix}_model">${this.providerName} Transcribe model</label>
            <select id="${this.idPrefix}_model">
                ${options}
            </select>
        </div>
        `;
    }

    /**
     * Called when provider settings are updated from the UI.
     */
    onSettingsChange() {
        const model = String($(`#${this.idPrefix}_model`).val());
        this.settings.model = model;
    }

    /**
     * Load and validate settings.
     * @param {object} settings - Settings object to load
     */
    loadSettings(settings) {
        if (Object.keys(settings).length === 0) {
            console.debug(this.debugPrefix + `Using default ${this.providerName} STT extension settings`);
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
        $(`#${this.idPrefix}_model`).val(this.settings.model);
        console.debug(this.debugPrefix + `${this.providerName} STT settings loaded`, this.settings);
    }

    /**
     * Process audio blob and return transcribed text.
     * @param {Blob} audioBlob - The audio blob to transcribe
     * @returns {Promise<string>} Transcribed text
     */
    async processAudio(audioBlob) {
        if (this.secretKey && !secret_state[this.secretKey]) {
            toastr.error('Save the secret key first, then try again', `No API key saved for ${this.providerName}`);
            throw new Error(`Missing API key for ${this.providerName}`);
        }

        const requestData = new FormData();
        requestData.append('avatar', audioBlob, 'record.wav');
        requestData.append('model', this.settings.model || this.defaultSettings.model);

        if (this.settings.language) {
            requestData.append('language', this.settings.language);
        }

        console.debug(this.debugPrefix + 'Model STT: ', this.settings.model);

        const apiResult = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: getRequestHeaders({ omitContentType: true }),
            body: requestData,
        });

        if (!apiResult.ok) {
            toastr.error(apiResult.statusText, `STT Generation Failed (${this.providerName})`, { timeOut: 10000, extendedTimeOut: 20000, preventDuplicates: true });
            throw new Error(`HTTP ${apiResult.status}: ${await apiResult.text()}`);
        }

        const result = await apiResult.json();
        return result.text;
    }
}
