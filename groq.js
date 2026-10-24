import { SttBaseProvider } from './stt-base.js';
import { SECRET_KEYS } from '../../../secrets.js';

export class GroqSttProvider extends SttBaseProvider {
    constructor() {
        super();
        this.providerName = 'Groq';
        this.apiEndpoint = '/api/openai/groq/transcribe-audio';
        this.idPrefix = 'groq_stt';
        this.defaultSettings = {
            language: '',
            model: 'whisper-large-v3',
        };
        this.modelOptions = [
            { value: 'whisper-large-v3', label: 'whisper-large-v3' },
            { value: 'whisper-large-v3-turbo', label: 'whisper-large-v3-turbo' },
        ];
        this.providerNote = 'Set the API key in Chat Completion => Groq first.';
        this.secretKey = SECRET_KEYS.GROQ;
    }
}
