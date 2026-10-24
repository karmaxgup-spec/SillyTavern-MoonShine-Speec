import { SttBaseProvider } from './stt-base.js';
import { SECRET_KEYS } from '../../../secrets.js';

export class ZaiSttProvider extends SttBaseProvider {
    constructor() {
        super();
        this.providerName = 'Z.AI';
        this.apiEndpoint = '/api/openai/zai/transcribe-audio';
        this.idPrefix = 'zai_stt';
        this.defaultSettings = {
            language: '',
            model: 'glm-asr-2512',
        };
        this.modelOptions = [
            { value: 'glm-asr-2512', label: 'glm-asr-2512' },
        ];
        this.providerNote = 'Set the API key in Chat Completion => Z.AI first. Will use Common API. Coding API is not supported!';
        this.secretKey = SECRET_KEYS.ZAI;
    }
}
