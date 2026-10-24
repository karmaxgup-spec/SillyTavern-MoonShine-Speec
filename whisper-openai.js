import { SttBaseProvider } from './stt-base.js';
import { SECRET_KEYS } from '../../../secrets.js';

export class OpenAISttProvider extends SttBaseProvider {
    constructor() {
        super();
        this.providerName = 'OpenAI';
        this.apiEndpoint = '/api/openai/transcribe-audio';
        this.idPrefix = 'openai_stt';
        this.defaultSettings = {
            language: '',
            model: 'whisper-1',
        };
        this.modelOptions = [
            { value: 'gpt-4o-mini-transcribe', label: 'gpt-4o-mini-transcribe' },
            { value: 'gpt-4o-transcribe', label: 'gpt-4o-transcribe' },
            { value: 'whisper-1', label: 'whisper-1' },
        ];
        this.providerNote = 'Set the API key in Chat Completion => OpenAI first.';
        this.secretKey = SECRET_KEYS.OPENAI;
    }
}
