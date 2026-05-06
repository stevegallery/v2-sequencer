// --- CONFIGURATION ---
let steps = 8
let tempo = 240
let isPlaying = false
let isSetupLen = true
let isSetupBpm = false
let editCursor = 0
let fullScale = [16, 18, 20, 21, 24, 27, 31, 33, 37, 41, 44, 49, 55, 62, 65, 73, 82, 87, 98, 110, 123, 131, 147, 165, 175, 196, 220, 247, 262, 294, 330, 349, 392, 440, 494]

let sequenceType: string[] = []
let sequenceData: number[] = []
let sequenceWave: number[] = []

for (let i = 0; i < 32; i++) {
    sequenceType.push("D"); sequenceData.push(0); sequenceWave.push(2)
}

// --- DRUM SYNTH (Restored #7 Crash) ---
function playDrum(index: number) {
    if (index == 0) music.play(music.createSoundExpression(WaveShape.Sine, 120, 1, 255, 0, 80, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    else if (index == 1) music.play(music.createSoundExpression(WaveShape.Noise, 600, 1, 255, 0, 60, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    else if (index == 2) music.play(music.createSoundExpression(WaveShape.Noise, 3000, 1, 200, 0, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    else if (index == 3) music.play(music.createSoundExpression(WaveShape.Triangle, 180, 60, 255, 0, 120, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    else if (index == 4) music.play(music.createSoundExpression(WaveShape.Noise, 2500, 1, 255, 0, 300, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground) // Restored Crash
}

// --- RANDOMIZER & CONTROLS ---
input.onGesture(Gesture.Shake, function () {
    if (!isPlaying && !isSetupLen && !isSetupBpm) {
        for (let i = 0; i < steps; i++) {
            if (Math.randomRange(0, 1) == 0) {
                sequenceType[i] = "D"; sequenceData[i] = Math.randomRange(0, 4)
            } else {
                sequenceType[i] = "N"; sequenceData[i] = Math.randomRange(0, 34); sequenceWave[i] = Math.randomRange(0, 3)
            }
        }
        music.playTone(440, 100); updateDisplay()
    }
})

input.onButtonPressed(Button.A, function () {
    if (isSetupLen) { if (steps > 2) steps /= 2; basic.showNumber(steps, 60) }
    else if (isSetupBpm) { tempo = Math.max(40, tempo - 20); basic.showNumber(tempo, 60) }
    else if (!isPlaying) { editCursor = (editCursor + 1) % steps; updateDisplay(); preview() }
})

input.onButtonPressed(Button.B, function () {
    if (isSetupLen) { if (steps < 32) steps *= 2; basic.showNumber(steps, 60) }
    else if (isSetupBpm) { tempo = Math.min(600, tempo + 20); basic.showNumber(tempo, 60) }
    else if (!isPlaying) {
        let limit = (sequenceType[editCursor] == "D") ? 5 : (sequenceType[editCursor] == "N" ? 35 : 4)
        sequenceData[editCursor] = (sequenceData[editCursor] + 1) % limit
        updateDisplay(); preview()
    }
})

input.onButtonPressed(Button.AB, function () {
    if (isSetupLen) { isSetupLen = false; isSetupBpm = true; basic.showNumber(tempo, 60) }
    else if (isSetupBpm) { isSetupBpm = false; basic.clearScreen(); updateDisplay() }
    else if (!isPlaying) {
        if (sequenceType[editCursor] == "D") sequenceType[editCursor] = "N"
        else if (sequenceType[editCursor] == "N") sequenceType[editCursor] = "I"
        else sequenceType[editCursor] = "D"
        updateDisplay(); preview()
    }
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (!isSetupLen && !isSetupBpm) { isPlaying = !isPlaying; if (!isPlaying) updateDisplay() }
})

function preview() {
    if (sequenceType[editCursor] == "D") playDrum(sequenceData[editCursor])
    else {
        let waves = [WaveShape.Sine, WaveShape.Square, WaveShape.Triangle, WaveShape.Sawtooth]
        let f = fullScale[sequenceData[editCursor]]
        music.play(music.createSoundExpression(waves[sequenceWave[editCursor]], f, f, 255, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    }
}

function updateDisplay() {
    basic.clearScreen()
    if (sequenceType[editCursor] == "I") led.plotBrightness(editCursor % 5, Math.floor(editCursor / 5), 100)
    else led.plot(editCursor % 5, Math.floor(editCursor / 5))
}

control.inBackground(function () {
    let playIdx = 0
    while (true) {
        if (isPlaying) {
            basic.clearScreen(); led.plot(playIdx % 5, Math.floor(playIdx / 5))
            if (sequenceType[playIdx] == "D") {
                playDrum(sequenceData[playIdx])
            } else {
                let waves = [WaveShape.Sine, WaveShape.Square, WaveShape.Triangle, WaveShape.Sawtooth]
                let f = fullScale[sequenceData[playIdx]]
                music.play(music.createSoundExpression(waves[sequenceWave[playIdx]], f, f, 255, 255, 100, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
            }
            playIdx = (playIdx + 1) % steps
            basic.pause(30000 / tempo)
        } else { playIdx = 0; basic.pause(100) }
    }
})

basic.showNumber(8, 60)
