// --- Global Settings ---
let steps = 8 // Set to 8 for the demo, can be up to 32
let tempo = 120
let isPlaying = false
// C Major Scale Frequencies
let scale = [262, 294, 330, 349, 392, 440, 494]

// Arrays to store sequence data
let sequenceType: string[] = [] // "N" for Note, "S" for Sound FX
let sequenceData: number[] = [] // Stores frequency or FX choice

// --- Initialization ---
for (let i = 0; i < steps; i++) {
    sequenceType.push("N")
    sequenceData.push(scale[i % 7])
}

// --- Playback & Korg Filter Engine ---
basic.forever(function () {
    if (isPlaying) {
        for (let i = 0; i < steps; i++) {
            if (!isPlaying) break;

            // Visual Playhead
            led.plot(i % 5, Math.floor(i / 5))

            // READ LIGHT SENSOR for Filter Cutoff
            // Maps light (0-255) to frequency (400Hz to 4000Hz)
            let lightVal = input.lightLevel()
            let cutoff = Math.map(lightVal, 0, 255, 400, 4000)

            if (sequenceType[i] == "N") {
                // Play Note with Sawtooth + Resonant (Warble) Effect
                // We build the expression as a string to avoid the Type Error
                let noteWave = music.createSoundExpression(
                    WaveShape.Sawtooth,
                    cutoff,      // Start freq (Filter Cutoff)
                    cutoff + 10, // Small slide
                    255, 255,    // Volume
                    150,         // Duration
                    SoundExpressionEffect.Warble,
                    InterpolationCurve.Linear
                )
                // Use .play() on the expression directly
                noteWave.playUntilDone()
            } else {
                // Built-in Sound FX placeholder
                soundExpression.giggle.playUntilDone()
            }

            basic.pause(60000 / tempo)
            led.unplot(i % 5, Math.floor(i / 5))
        }
    }
})

// --- Touch Logo to Play/Pause ---
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    isPlaying = !isPlaying
    if (!isPlaying) basic.clearScreen()
})
