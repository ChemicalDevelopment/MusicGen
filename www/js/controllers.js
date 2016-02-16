angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope) {
})

.controller('AboutCtrl', function ($scope) {
})

.controller('GenerateCtrl', function ($scope) {
    /*
    Used for buttons!
    */

    var vm = this;

    vm.keyValues = {
        "C": 16.35,
        "C#/Db": 17.32,
        "D": 18.35,
        "D#/Eb": 19.45,
        "E": 20.6,
        "F": 21.83,
        "F#/Gb": 23.12,
        "G": 24.5,
        "G#/Ab": 25.96,
        "A": 27.5,
        "A#/Bb": 29.14,
        "B": 30.87,
    }
    //this used to work differently. I am lazy.
    vm.waveforms = {
        "sine": "sine",
        "square": "square",
        "sawtooth": "sawtooth",
        "triangle": "triangle",
    }

    var triads = {
        'I': [0, 4, 7],
        'ii': [2, 5, 9],
        'iii': [4, 7, 11],
        'IV': [5, 9, 12],
        'V': [7, 11, 14],
        'vi': [9, 12, 16],
        'vii': [11, 14, 18],
        'Imaj7': [0, 4, 11],
    }

    vm.chordProgs = {
        "Believing (I-V-vi-IV)": [
            triads['I'],
            triads['V'],
            triads['vi'],
            triads['IV']
        ],
        'Annette (ii-IV-I-V)': [
            triads['ii'],
            triads['IV'],
            triads['I'],
            triads['V']
        ],
        "50's (I-vi-IV-V)": [
            triads['I'],
            triads['vi'],
            triads['IV'],
            triads['V']
        ],
        'Canon (I-V-vi-iii-IV-I-IV-V)': [
            triads['I'],
            triads['V'],
            triads['vi'],
            triads['iii'],
            triads['IV'],
            triads['I'],
            triads['IV'],
            triads['V']
        ],
        "Good Love (I-IV-V-IV)": [
            triads['I'],
            triads['IV'],
            triads['V'],
            triads['IV']
        ],
        "Sweet Child (V-V-IV-IV-I-I-V-V)": [
            triads['V'],
            triads['V'],
            triads['IV'],
            triads['IV'],
            triads['I'],
            triads['I'],
            triads['V'],
            triads['V'],
        ],
        "Dream (vi-V-IV-V)": [
            triads['vi'],
            triads['V'],
            triads['IV'],
            triads['V']
        ],
        "Jazzy (ii-V-I-Imaj7)": [
            triads['ii'],
            triads['V'],
            triads['I'],
            triads['Imaj7']
        ],

    };

    vm.octaves = [0, 1, 2, 3, 4, 5];
    vm.ranges = [1, 2, 3, 4];

    //Configurations
    vm.selectedOctave = 3;
    vm.selectedRange = 2;
    vm.selectedChordProg = vm.chordProgs["Believing (I-V-vi-IV)"];
    vm.selectedKey = vm.keyValues["A"];
    vm.waveform = vm.waveforms["sine"];
    vm.actualRange = vm.selectedRange * 12;
    vm.selectedTempo = 100;

    vm.visualizeChor1 = false;
    vm.visualizeChor2 = false;
    vm.visualizeChor3 = false;
    vm.visualizeMelody = true;

    var base;
    //used with calculating notes
    var a = Math.pow(2, 1 / 12);
    var chordType;
    var melodyType;
    var context;
    var notesPerMeasure = 4;
    var qtrNote = 600;
    var eigthNote = qtrNote / 2;
    var minNote = eigthNote;
    var time;
    var melodyInt;
    var chor1, chor2, chor3, melody, chordGain, melodyGain;
    vm.isRunning = false;

    //All browsers, hooray
    try {
        context = new AudioContext();
    } catch (err) {
        context = new webkitAudioContext();
    }


    vm.visualSetting = "off";

    var analyser = context.createAnalyser();

    var canvas = document.getElementById('canv');
    var canvasCtx = canv.getContext('2d');

    function visualize() {
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        
        var visualSetting = vm.visualSetting;

        console.log(visualSetting);

        if (visualSetting == "wave") {
            analyser.fftSize = 2048;
            var bufferLength = analyser.fftSize;
            console.log(bufferLength);
            var dataArray = new Uint8Array(bufferLength);

            canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

            function drawWave() {

                drawVisual = requestAnimationFrame(drawWave);

                analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = 'rgb(255,0,0)';

                canvasCtx.beginPath();

                var sliceWidth = canvasWidth * 1.0 / bufferLength;
                var x = 0;

                for (var i = 0; i < bufferLength; i++) {

                    var v = dataArray[i] / 128.0;
                    var y = v * canvasHeight/2;

                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                canvasCtx.lineTo(canvas.width, canvas.height / 2);
                canvasCtx.stroke();
            };

            drawWave();

        } else if (visualSetting == "bars") {
            analyser.fftSize = 256;
            var bufferLength = analyser.frequencyBinCount;
            console.log(bufferLength);
            var dataArray = new Uint8Array(bufferLength);

            canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

            function drawFrequencyBars() {
                drawVisual = requestAnimationFrame(drawFrequencyBars);

                analyser.getByteFrequencyData(dataArray);

                canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);

                var barWidth = (canvasWidth / bufferLength) * 2.5;
                var barHeight;
                var x = 0;

                for (var i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i];

                    canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                    canvasCtx.fillRect(x, canvasHeight - barHeight / 2, barWidth, barHeight / 2);

                    x += barWidth + 1;
                }
            };

            drawFrequencyBars();

        } else if (visualSetting == "off") {
            drawVisual = null;
            canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            canvasCtx.fillStyle = "black";
            canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

    }
    
    visualize();
    
    

    //volume
    chordGain = context.createGain();
    melodyGain = context.createGain();
    chordGain.gain.value = 0.05;
    melodyGain.gain.value = 0.1;
    //melodyGain.gain.value = 0.0;

    //End Configurations

    init = function () {

        updateBase();
        updateWaveformType();
        buildScale();

        //hook everything up
        chor1 = context.createOscillator();
        chor2 = context.createOscillator();
        chor3 = context.createOscillator();
        melody = context.createOscillator();



        chor1.connect(chordGain);
        chor2.connect(chordGain);
        chor3.connect(chordGain);
        melody.connect(melodyGain);
        chordGain.connect(context.destination);
        melodyGain.connect(context.destination);

        // connect the melody to the analyser for visualization
        //melody.connect(analyser);
        //chor1.connect(analyser);
        //chor2.connect(analyser);
        //chor3.connect(analyser);
        connectOrDisconnect(melody, vm.visualizeMelody, true);
        connectOrDisconnect(chor1, vm.visualizeChor1, true);
        connectOrDisconnect(chor2, vm.visualizeChor2, true);
        connectOrDisconnect(chor3, vm.visualizeChor3, true);

        //Set type of wave for chord
        chor1.type = chordType;
        chor2.type = chordType;
        chor3.type = chordType;

        //Set type of wave for melody
        melody.type = melodyType;

        melody.frequency.value = base;

        var prog = vm.selectedChordProg;

        vm.actualRange = vm.selectedRange * 12;
        var ar = notes.length;
        chor1.frequency.value = notes[prog[0][0] % ar];
        chor2.frequency.value = notes[prog[0][1] % ar];
        chor3.frequency.value = notes[prog[0][2] % ar];
    }

    // Build scale
    var buildScale = function () {
        notes = [];
        var freq = base;
        var step = 0;
        for (var i = 0; i < vm.actualRange; i++) {
            notes[i] = freq;
            step++;
            //if (i % 7 != 2 && i % 7 != 6) {
            //    step++;
            //}
            freq = base * Math.pow(a, step);
        }
    }

    var playInKey = true;
    //var rest = false;
    //    var restLastTime = false;

    var sus = false;
        var changeSusOn = 0;

    //melody function
    var melodyFun = function () {
        var prog = vm.selectedChordProg;
        time++;
        var ar = notes.length;
        //chord progression    
        if (time % (notesPerMeasure * (qtrNote / minNote)) == 0 && time != 0) {
            chord++;
            chord %= prog.length;
            chor1.frequency.value = notes[prog[chord][0] % ar];

            // if suspended chords is enabled, do some randomization of the middle voice
            if (vm.suspendedChords) {
                sus = getRandomBool();

                if (sus) {
                    changeSusOn = time + getRandomInt(1, 4);
                } else {
                    chor2.frequency.value = notes[prog[chord][1] % ar];
                    changeSusOn = 0;
                }
            } else {
                chor2.frequency.value = notes[prog[chord][1] % ar];
            }

            chor3.frequency.value = notes[prog[chord][2] % ar];
           
        } else if(sus && (changeSusOn == time)) {
            if (sus) {
                chor2.frequency.value = notes[prog[chord][1] % ar];

                sus = false;
                changeSusOn = 0;
            }
        }
        //Random note length
        if (time % (Math.floor(Math.random() * (qtrNote / minNote))) == 0) {
            //random note 0 to range-1
            var note = Math.floor((Math.random() * (ar - 1)));

            // if we hit an off-note, pick one of the notes in the current chord
            if (playInKey) {
                var noteMod = note % 12;
                if (noteMod === 1) note = prog[chord][0];
                else if (noteMod === 3) note = prog[chord][1];
                else if (noteMod === 6) note = prog[chord][1];
                else if (noteMod === 8) note = prog[chord][2];
                else if (noteMod === 10) note = prog[chord][2];
            }

            freq = notes[note % ar];

            melody.frequency.value = freq;
        }
    }

    function getRandomBool() {
        return (Math.random() > .5);
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var beginFunc = function () {
        if (!vm.isRunning) {
            init();
            chord = 0;
            step = 0;
            time = 0;
            //run melody function based on minimum note length
            melodyInt = setInterval(melodyFun, minNote);
            melody.start(0);
            chor1.start(0);
            chor2.start(0);
            chor3.start(0);

            vm.isRunning = true;
        } else {
            endFunc();
            beginFunc();
        }
    }

    // Click to end the madness
    var endFunc = function () {
        if (vm.isRunning) {
            chor1.stop(0);
            chor2.stop(0);
            chor3.stop(0);
            melody.stop(0);
            clearInterval(melodyInt);
            vm.isRunning = false;
        }
    }

    var updateBase = function () {
        base = vm.selectedKey * Math.pow(2, vm.selectedOctave);
    }
    var updateWaveformType = function () {
        chordType = vm.waveform;
        melodyType = vm.waveform;
    }

    function restart() {
        if (vm.isRunning) {
            endFunc();
            beginFunc();
        }
    }

    vm.restart = restart;
        vm.start = beginFunc;
    vm.end =  endFunc;

    vm.updateTempo = function () {
        //  checkBpmInput(newTempo);
        qtrNote = Math.floor(Math.pow(vm.selectedTempo / 60 / 1000, -1));
        eigthNote = qtrNote / 2;
        minNote = eigthNote;
        restart();
    }

    vm.updateVisualization = function () {
        if (drawVisual)
            window.cancelAnimationFrame(drawVisual);

        visualize();
    }
    
    vm.updateVisualizationMelody = function () {
        connectOrDisconnect(melody, vm.visualizeMelody);
    }
    vm.updateVisualizationChor1 = function () {
        connectOrDisconnect(chor1, vm.visualizeChor1);
    }
    vm.updateVisualizationChor2 = function () {
        connectOrDisconnect(chor2, vm.visualizeChor2);
    }
    vm.updateVisualizationChor3 = function () {
        connectOrDisconnect(chor3, vm.visualizeChor3);
    }

    function connectOrDisconnect(osc, con, init) {
        if (osc) {
            if (con) {
                osc.connect(analyser);
            } else if(!init) {
                osc.disconnect(analyser);
            }
        }
    }

    vm.resetAll = function () {
        vm.selectedRange = 2;
        vm.selectedChordProg = vm.chordProgs["Believing (I-V-vi-IV)"];
        vm.selectedKey = vm.keyValues["A"];
        vm.waveform = vm.waveforms["sine"];
        vm.selectedOctave = 3;
        vm.actualRange = vm.selectedRange * 12;
        vm.suspendedChords = false;
        vm.selectedTempo = 100;
        vm.updateTempo(vm.selectedTempo);

        vm.visualSetting = 'off';
        vm.updateVisualization();
        vm.visualizeChor1 = false;
        vm.visualizeChor2 = false;
        vm.visualizeChor3 = false;
        vm.visualizeMelody = true;

        restart();
    }
})

