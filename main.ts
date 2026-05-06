// --- CONFIGURATION ---
let steps = 8
let tempo = 240
let isPlaying = false
let isSetupLen = true
let isSetupBpm = false
let editCursor = 0
let editMode = "D"

// 5 OCTAVES OF C MAJOR (C0 to C5)
let fullScale = [
    16, 18, 20, 21, 24, 27, 31,     // Octave 0 (Sub)
    33, 37, 41, 44, 49, 55, 62,     // Octave 1 (Low C starts at index 7)
    65, 73, 82, 87, 98, 110, 123,   // Octave 2
    131, 147, 165, 175, 196, 220, 247, // Octave 3
    262, 294, 330, 349, 392, 440, 494  // Octave 4/5
]

let drumLayer: number[] = []; let noteLayer: number[] = []; let waveLayer: number[] = []

// --- INITIALIZE: KICK + LOW C ---
for (let i = 0; i < 32; i++) {
    drumLayer.push(0)  // 0 = Kick Drum
    noteLayer.push(8)  // 8 = C1 (Low C) in our fullScale array
    waveLayer.push(2)  // 2 = Triangle Wave (Best for bass)
}

// --- SOUND ENGINES ---
function playDrum(index: number) {
    if (index == 0) music.play(music.createSoundExpression(WaveShape.Sine, 120, 1, 255, 0, 80, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    else if (index == 1) music.play(music.createSoundExpression(WaveShape.Noise, 600, 1, 255, 0, 60, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    else if (index == 2) music.play(music.createSoundExpression(WaveShape.Noise, 3000, 1, 200, 0, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    else if (index == 3) music.play(music.createSoundExpression(WaveShape.Triangle, 180, 60, 255, 0, 120, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    else if (index == 4) music.play(music.createSoundExpression(WaveShape.Noise, 2500, 1, 255, 0, 300, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
}

function playNote(pitchIdx: number, waveIdx: number) {
    if (pitchIdx > 0) {
        let waves = [WaveShape.Sine, WaveShape.Square, WaveShape.Triangle, WaveShape.Sawtooth]
        let f = fullScale[pitchIdx - 1]
        music.play(music.createSoundExpression(waves[waveIdx], f, f, 255, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    }
}

// --- VISUALS ---
function drawPath() {
    basic.clearScreen()
    for (let i = 0; i < steps; i++) {
        led.plotBrightness(i % 5, Math.floor(i / 5), 20)
    }
}

function updateDisplay() {
    drawPath()
    led.plotBrightness(editCursor % 5, Math.floor(editCursor / 5), 255)
}

// --- CONTROLS ---
input.onButtonPressed(Button.A, function () {
    if (isSetupLen) { if (steps > 2) steps /= 2; basic.showNumber(steps, 60) }
    else if (isSetupBpm) { tempo = Math.max(40, tempo - 20); basic.showNumber(tempo, 60) }
    else if (!isPlaying) { editCursor = (editCursor + 1) % steps; updateDisplay(); preview() }
})

input.onButtonPressed(Button.B, function () {
    if (isSetupLen) { if (steps < 32) steps *= 2; basic.showNumber(steps, 60) }
    else if (isSetupBpm) { tempo = Math.min(600, tempo + 20); basic.showNumber(tempo, 60) }
    else if (!isPlaying) {
        if (editMode == "D") drumLayer[editCursor] = (drumLayer[editCursor] + 1) % 6
        else if (editMode == "N") noteLayer[editCursor] = (noteLayer[editCursor] + 1) % 37
        else waveLayer[editCursor] = (waveLayer[editCursor] + 1) % 4
        updateDisplay(); preview()
    }
})

input.onButtonPressed(Button.AB, function () {
    if (isSetupLen) { isSetupLen = false; isSetupBpm = true; basic.showNumber(tempo, 60) }
    else if (isSetupBpm) { isSetupBpm = false; updateDisplay() }
    else if (!isPlaying) {
        if (editMode == "D") editMode = "N"
        else if (editMode == "N") editMode = "I"
        else editMode = "D"
        updateDisplay(); preview()
    }
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (!isSetupLen && !isSetupBpm) { isPlaying = !isPlaying; if (!isPlaying) updateDisplay() }
})

input.onGesture(Gesture.Shake, function () {
    if (!isPlaying && !isSetupLen && !isSetupBpm) {
        for (let i = 0; i < steps; i++) {
            drumLayer[i] = Math.randomRange(0, 5)
            noteLayer[i] = Math.randomRange(0, 36)
            waveLayer[i] = Math.randomRange(0, 3)
        }
        music.playTone(440, 100); updateDisplay()
    }
})

function preview() {
    playDrum(drumLayer[editCursor])
    playNote(noteLayer[editCursor], waveLayer[editCursor])
}

// --- PLAYBACK ENGINE ---
control.inBackground(function () {
    let playIdx = 0
    while (true) {
        if (isPlaying) {
            drawPath()
            led.plotBrightness(playIdx % 5, Math.floor(playIdx / 5), 255)
            playDrum(drumLayer[playIdx])
            playNote(noteLayer[playIdx], waveLayer[playIdx])
            playIdx = (playIdx + 1) % steps
            basic.pause(30000 / tempo)
        } else { playIdx = 0; basic.pause(100) }
    }
})

basic.showNumber(8, 60)
