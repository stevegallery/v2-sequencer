// --- CONFIGURATION ---
let steps = 8
let tempo = 240
let isPlaying = false
let isSetupLen = true
let isSetupBpm = false
let editCursor = 0
let editMode = "D"
let numDrumSounds = 5;
let scale = [65, 73, 82, 87, 98, 110, 123, 131, 147, 165, 175, 196, 220, 247, 262, 294, 330, 349, 392, 440, 494]

let drumLayer: number[] = []; let noteLayer: number[] = []; let waveLayer: number[] = []

for (let i = 0; i < 32; i++) {
    drumLayer.push(0); noteLayer.push(0); waveLayer.push(0)
}

// --- INTELLIGENT INSTRUMENT FILTER ENGINE ---
function playComplexNote(pitchIdx: number, instIdx: number, sDur: number) {
    if (pitchIdx <= 0) return;
    let f = scale[pitchIdx - 1];
    let light = input.lightLevel(); // 0-255

    if (instIdx == 0) {
        // PLUCK: Light controls Resonance (Warble)
        let warble = (light > 128) ? SoundExpressionEffect.Warble : SoundExpressionEffect.None;
        music.play(music.createSoundExpression(WaveShape.Square, f, f, 255, 0, sDur, warble, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    }
    else if (instIdx == 1) {
        // ACID: Light controls Filter Cutoff (The "Wah")
        let cutoff = Math.map(light, 0, 255, f, f + 2500);
        music.play(music.createSoundExpression(WaveShape.Sawtooth, f, cutoff, 255, 50, sDur, SoundExpressionEffect.None, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
    }
    else if (instIdx == 2) {
        // STRINGS: Light controls Vibrato Intensity
        let vib = (light > 100) ? SoundExpressionEffect.Vibrato : SoundExpressionEffect.None;
        music.play(music.createSoundExpression(WaveShape.Sawtooth, f, f, 100, 255, sDur, vib, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    }
    else if (instIdx == 3) {
        // LEAD: Light controls Pitch Glide (Whammy)
        let glide = Math.map(light, 0, 255, f, f + 12); // Subtle pitch slide up
        music.play(music.createSoundExpression(WaveShape.Sawtooth, glide, f, 255, 150, sDur, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    }
    else {
        // SINE BELL: Light controls Sustain (Decay)
        let sustain = Math.map(light, 0, 255, sDur * 0.5, sDur * 3);
        music.play(music.createSoundExpression(WaveShape.Sine, f, f, 255, 0, sustain, SoundExpressionEffect.None, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
    }
}

// --- CORE SEQUENCER LOGIC ---
function playSingleDrum(index: number, sDur: number) {
    if (index == 0) music.play(music.createSoundExpression(WaveShape.Sine, 120, 1, 160, 0, sDur, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    else if (index == 1) music.play(music.createSoundExpression(WaveShape.Noise, 600, 1, 140, 0, sDur * 0.8, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    else if (index == 2) music.play(music.createSoundExpression(WaveShape.Noise, 3000, 1, 130, 0, sDur * 1.2, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    else if (index == 3) music.play(music.createSoundExpression(WaveShape.Triangle, 180, 60, 150, 0, sDur, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    else if (index == 4) music.play(music.createSoundExpression(WaveShape.Noise, 2500, 1, 140, 0, sDur * 2, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
}

function triggerStep(dIdx: number, nIdx: number, wIdx: number, isolated: boolean) {
    music.stopAllSounds()
    let sDur = (30000 / tempo) * 0.6
    if (isolated) {
        if (editMode == "D") playSingleDrum(dIdx, sDur)
        else playComplexNote(nIdx, wIdx, sDur)
    } else {
        playSingleDrum(dIdx, sDur)
        playComplexNote(nIdx, wIdx, sDur)
    }
}

function drawPath() {
    basic.clearScreen()
    for (let i = 0; i < steps; i++) led.plotBrightness(i % 5, Math.floor(i / 5), 20)
}

function updateDisplay() {
    if (!isPlaying) {
        drawPath()
        if (editMode == "D") led.plotBrightness(0, 4, 150)
        else if (editMode == "N") led.plotBrightness(2, 4, 150)
        else if (editMode == "I") led.plotBrightness(4, 4, 150)
        led.plotBrightness(editCursor % 5, Math.floor(editCursor / 5), 255)
    }
}

input.onButtonPressed(Button.A, function () {
    if (isSetupLen) { steps = (steps > 2) ? steps / 2 : 2; basic.showNumber(steps, 60) }
    else if (isSetupBpm) { tempo = Math.max(40, tempo - 20); basic.showNumber(tempo, 60) }
    else if (isPlaying) { tempo = Math.max(40, tempo - 20) }
    else { editCursor = (editCursor + 1) % steps; updateDisplay(); triggerStep(drumLayer[editCursor], noteLayer[editCursor], waveLayer[editCursor], false) }
})

input.onButtonPressed(Button.B, function () {
    if (isSetupLen) { steps = (steps < 32) ? steps * 2 : 32; basic.showNumber(steps, 60) }
    else if (isSetupBpm) { tempo = Math.min(600, tempo + 20); basic.showNumber(tempo, 60) }
    else if (isPlaying) { tempo = Math.min(600, tempo + 20) }
    else {
        if (editMode == "D") drumLayer[editCursor] = (drumLayer[editCursor] + 1) % numDrumSounds;
        else if (editMode == "N") noteLayer[editCursor] = (noteLayer[editCursor] + 1) % 22
        else waveLayer[editCursor] = (waveLayer[editCursor] + 1) % 5
        updateDisplay(); triggerStep(drumLayer[editCursor], noteLayer[editCursor], waveLayer[editCursor], false)
    }
})

input.onButtonPressed(Button.AB, function () {
    if (isSetupLen) { isSetupLen = false; isSetupBpm = true; basic.showNumber(tempo, 60) }
    else if (isSetupBpm) { isSetupBpm = false; basic.clearScreen(); updateDisplay() }
    else if (!isPlaying) {
        editMode = (editMode == "D") ? "N" : (editMode == "N" ? "I" : "D")
        updateDisplay(); triggerStep(drumLayer[editCursor], noteLayer[editCursor], waveLayer[editCursor], true)
    }
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (!isSetupLen && !isSetupBpm) { isPlaying = !isPlaying; if (!isPlaying) updateDisplay() }
})

input.onGesture(Gesture.Shake, function () {
    if (!isPlaying && !isSetupLen && !isSetupBpm) {
        music.play(music.createSoundExpression(WaveShape.Square, 400, 1500, 255, 0, 300, SoundExpressionEffect.Vibrato, InterpolationCurve.Logarithmic), music.PlaybackMode.InBackground)
        for (let i = 0; i < steps; i++) {
            drumLayer[i] = Math.randomRange(0, numDrumSounds - 1)
            noteLayer[i] = Math.randomRange(0, 21); waveLayer[i] = Math.randomRange(0, 4)
        }
        basic.showIcon(IconNames.Diamond, 10); updateDisplay()
    }
})

control.inBackground(function () {
    let playIdx = 0
    while (true) {
        if (isPlaying) {
            drawPath()
            led.plotBrightness(playIdx % 5, Math.floor(playIdx / 5), 255)
            triggerStep(drumLayer[playIdx], noteLayer[playIdx], waveLayer[playIdx], false)
            playIdx = (playIdx + 1) % steps
            basic.pause(30000 / tempo)
        } else { playIdx = 0; basic.pause(100) }
    }
})

basic.showNumber(8, 60)
