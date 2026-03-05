import { AudioManager } from '../../client/audio/AudioManager';
import { DefconManager } from './DefconManager';

export class DefconAudioAdapter {
    public static hook(newLevel: number) {
        // Only trigger the terrifying siren if the threat escalates
        if (newLevel < DefconManager.currentDefcon) {
            AudioManager.playDefconSiren(newLevel);
        }
    }
}