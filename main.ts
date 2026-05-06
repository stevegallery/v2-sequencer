// --- CONFIGURATION ---
let steps = 16
let tempo = 120
let isPlaying = false
let editCursor = 0
let scale = [262, 294, 330, 349, 392, 440, 494] // C Major Scale

// Data Arrays
let sequenceType: string[] = [] // "D" for Drum, "N" for Note
let sequenceData: number[] = [] // Stores index for drum type or note

// --- INITIALIZE AS DRUMS ---
for (let i = 0; i < 32; i++) {
    sequenceType.push("D") // Default mode is now Drum
    sequenceData.push(0)   // Default sound is Kick
}

// --- PURE DRUM SYNTHESIS ---
function playDrum(index: number) {
    if (index == 0) { // KICK
        music.play(music.createSoundExpression(WaveShape.Sine, 100, 1, 255, 0, 100, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    } else if (index == 1) { // SNARE
        music.play(music.createSoundExpression(WaveShape.Square, 200, 1, 255, 0, 50, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
        music.play(music.createSoundExpression(WaveShape.Noise, 500, 1, 150, 0, 50, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    } else if (index == 2) { // HI-HAT
        music.play(music.createSoundExpression(WaveShape.Noise, 3000, 1, 200, 0, 30, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    } else if (index == 3) { // TOM
        music.play(music.createSoundExpression(WaveShape.Triangle, 150, 40, 255, 0, 150, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    } else { // COWBELL
        music.play(music.createSoundExpression(WaveShape.Square, 800, 800, 255, 0, 80, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    }
}

// --- PREVIEW & EDITING ---
function preview() {
    if (sequenceType[editCursor] == "D") {
        playDrum(sequenceData[editCursor])
    } else {
        music.playTone(scale[sequenceData[editCursor]], 150)
    }
}

// Button A: Navigate Steps
input.onButtonPressed(Button.A, function () {
    if (!isPlaying) {
        editCursor = (editCursor + 1) % steps
        updateDisplay()
        preview()
    }
})

// Button B: Cycle through sounds/notes
input.onButtonPressed(Button.B, function () {
    if (!isPlaying) {
        let limit = (sequenceType[editCursor] == "D") ? 5 : 7
        sequenceData[editCursor] = (sequenceData[editCursor] + 1) % limit
        updateDisplay()
        preview()
    }
})

// A+B: Toggle Mode
input.onButtonPressed(Button.AB, function () {
    if (!isPlaying) {
        sequenceType[editCursor] = (sequenceType[editCursor] == "D") ? "N" : "D"
        basic.showString(sequenceType[editCursor])
        sequenceData[editCursor] = 0
        updateDisplay()
        preview()
    }
})

// Logo: Play/Pause
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    isPlaying = !isPlaying
    if (!isPlaying) basic.clearScreen()
})

// --- RENDER & PLAYBACK ---
function updateDisplay() {
    basic.clearScreen()
    led.plot(editCursor % 5, Math.floor(editCursor / 5))
}

basic.forever(function () {
    if (isPlaying) {
        for (let i = 0; i < steps; i++) {
            if (!isPlaying) break;
            basic.clearScreen()
            led.plot(i % 5, Math.floor(i / 5))
            if (sequenceType[i] == "D") {
                playDrum(sequenceData[i])
                basic.pause(100)
            } else {
                music.playTone(scale[sequenceData[i]], 150)
            }
            basic.pause(60000 / tempo)
        }
    } else {
        updateDisplay()
    }
})

// Start-up message
basic.showString("DRUM")
updateDisplay()
