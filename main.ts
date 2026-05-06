// --- CONFIGURATION ---
let steps = 16
let tempo = 120
let isPlaying = false
let isSetupLen = true
let isSetupBpm = false
let editCursor = 0
let scale = [262, 294, 330, 349, 392, 440, 494] // C Major frequencies

let sequenceType: string[] = []
let sequenceData: number[] = []
let sequenceWave: number[] = []

// --- INITIALIZE DATA ARRAYS ---
// If you get a 'files' error, you can simply remove the save/load functions
for (let i = 0; i < 32; i++) {
    sequenceType.push("D")
    sequenceData.push(0)
    sequenceWave.push(2) // Default to Triangle (Index 2)
}

// --- PURE DRUM SYNTHESIS ---
function playDrum(index: number) {
    if (index == 0) music.play(music.createSoundExpression(WaveShape.Sine, 100, 1, 255, 0, 100, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    else if (index == 1) {
        music.play(music.createSoundExpression(WaveShape.Square, 200, 1, 255, 0, 50, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
        music.play(music.createSoundExpression(WaveShape.Noise, 500, 1, 150, 0, 50, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    } else if (index == 2) music.play(music.createSoundExpression(WaveShape.Noise, 3000, 1, 200, 0, 30, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
    else if (index == 3) music.play(music.createSoundExpression(WaveShape.Triangle, 150, 40, 255, 0, 150, SoundExpressionEffect.None, InterpolationCurve.Curve), music.PlaybackMode.InBackground)
    else music.play(music.createSoundExpression(WaveShape.Square, 800, 800, 255, 0, 80, SoundExpressionEffect.None, InterpolationCurve.Linear), music.PlaybackMode.InBackground)
}

function preview() {
    if (sequenceType[editCursor] == "D") playDrum(sequenceData[editCursor])
    else {
        let waves = [WaveShape.Sine, WaveShape.Square, WaveShape.Triangle, WaveShape.Sawtooth]
        let note = music.createSoundExpression(waves[sequenceWave[editCursor]], scale[sequenceData[editCursor]], scale[sequenceData[editCursor]], 255, 255, 150, SoundExpressionEffect.None, InterpolationCurve.Linear)
        note.play()
    }
}

// --- CONTROLS ---
input.onButtonPressed(Button.A, function () {
    if (isSetupLen) {
        steps = Math.max(1, steps - 1)
        basic.showNumber(steps, 60)
    } else if (isSetupBpm) {
        tempo = Math.max(40, tempo - 5)
        basic.showNumber(tempo, 60)
    } else if (!isPlaying) {
        editCursor = (editCursor + 1) % steps
        updateDisplay()
        preview()
    }
})

input.onButtonPressed(Button.B, function () {
    if (isSetupLen) {
        steps = Math.min(32, steps + 1)
        basic.showNumber(steps, 60)
    } else if (isSetupBpm) {
        tempo = Math.min(400, tempo + 5)
        basic.showNumber(tempo, 60)
    } else if (!isPlaying) {
        if (sequenceType[editCursor] == "D") {
            sequenceData[editCursor] = (sequenceData[editCursor] + 1) % 5
        } else if (sequenceType[editCursor] == "N") {
            sequenceData[editCursor] = (sequenceData[editCursor] + 1) % 7
        } else {
            sequenceWave[editCursor] = (sequenceWave[editCursor] + 1) % 4
        }
        updateDisplay()
        preview()
    }
})

input.onButtonPressed(Button.AB, function () {
    if (isSetupLen) {
        isSetupLen = false
        isSetupBpm = true
        basic.showString("B", 60)
    } else if (isSetupBpm) {
        isSetupBpm = false
        basic.clearScreen()
        updateDisplay()
    } else if (!isPlaying) {
        if (sequenceType[editCursor] == "D") sequenceType[editCursor] = "N"
        else if (sequenceType[editCursor] == "N") sequenceType[editCursor] = "I"
        else sequenceType[editCursor] = "D"
        updateDisplay()
        preview()
    }
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (!isSetupLen && !isSetupBpm) {
        isPlaying = !isPlaying
        if (!isPlaying) updateDisplay()
    }
})

function updateDisplay() {
    basic.clearScreen()
    if (sequenceType[editCursor] == "I") led.plotBrightness(editCursor % 5, Math.floor(editCursor / 5), 100)
    else led.plot(editCursor % 5, Math.floor(editCursor / 5))
}

basic.forever(function () {
    if (isPlaying) {
        for (let i = 0; i < steps; i++) {
            if (!isPlaying) break;
            basic.clearScreen()
            led.plot(i % 5, Math.floor(i / 5))
            if (sequenceType[i] == "D") playDrum(sequenceData[i])
            else {
                let waves = [WaveShape.Sine, WaveShape.Square, WaveShape.Triangle, WaveShape.Sawtooth]
                let note = music.createSoundExpression(waves[sequenceWave[i]], scale[sequenceData[i]], scale[sequenceData[i]], 255, 255, 150, SoundExpressionEffect.None, InterpolationCurve.Linear)
                note.playUntilDone()
            }
            basic.pause(60000 / tempo)
        }
    }
})

basic.showString("L", 60)
