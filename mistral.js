import { SttBaseProvider } from './stt-base.js';
import { SECRET_KEYS } from '../../../secrets.js';

export class MistralSttProvider extends SttBaseProvider {
    constructor() {
        super();
        this.providerName = 'MistralAI';
        this.apiEndpoint = '/api/openai/mistral/transcribe-audio';
        this.idPrefix = 'mistral_stt';
        this.defaultSettings = {
            language: '',
            model: 'voxtral-mini-latest',
        };
        this.modelOptions = [
            { value: 'voxtral-mini-latest', label: 'voxtral-mini-latest' },
        ];
        this.providerNote = 'Set the API key in Chat Completion => MistralAI first.';
        this.secretKey = SECRET_KEYS.MISTRALAI;
    }
}
