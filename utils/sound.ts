import { Audio } from "expo-av";

let sound: Audio.Sound | null = null;

export async function playNewCarsSound() {
    try {
        if (!sound) {
            const res = await Audio.Sound.createAsync(
                require("../assets/sounds/hupe.mp3"),
                { shouldPlay: false }
            );
            sound = res.sound;
        }

        await sound.setPositionAsync(0);
        await sound.playAsync();
    } catch (e) {
        console.log("🔊 Sound Fehler:", e);
    }
}
