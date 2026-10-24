import { SttBaseProvider } from './stt-base.js';
import { SECRET_KEYS } from '../../../secrets.js';

export class ElevenLabsSttProvider extends SttBaseProvider {
    constructor() {
        super();
        this.providerName = 'ElevenLabs';
        this.apiEndpoint = '/api/speech/elevenlabs/recognize';
        this.idPrefix = 'elevenlabs_stt';
        this.defaultSettings = {
            language: '',
            model: 'scribe_v1',
        };
        this.modelOptions = [
            { value: 'scribe_v1', label: 'scribe_v1' },
            { value: 'scribe_v1_experimental', label: 'scribe_v1_experimental' },
        ];
        this.providerNote = 'Set the API key in TTS => ElevenLabs provider first.';
        this.secretKey = SECRET_KEYS.ELEVENLABS;
    }
}
