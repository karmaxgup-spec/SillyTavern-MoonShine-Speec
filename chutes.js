import { SttBaseProvider } from './stt-base.js';
import { SECRET_KEYS } from '../../../secrets.js';

export class ChutesSttProvider extends SttBaseProvider {
    constructor() {
        super();
        this.providerName = 'Chutes';
        this.apiEndpoint = '/api/openai/chutes/transcribe-audio';
        this.idPrefix = 'chutes_stt';
        this.defaultSettings = {
            language: '',
            model: 'chutes-whisper-large-v3',
        };
        this.modelOptions = [
            { value: 'chutes-whisper-large-v3', label: 'chutes-whisper-large-v3' },
        ];
        this.providerNote = 'Set the API key in Chat Completion => Chutes first.';
        this.secretKey = SECRET_KEYS.CHUTES;
    }
}
