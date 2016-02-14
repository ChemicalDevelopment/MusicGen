angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope) {
})

.controller('AboutCtrl', function ($scope) {
})

.controller('GenerateCtrl', function ($scope) {
    /*
    Used for buttons!
    */
    $scope.keyValues = {
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
    $scope.waveforms = {
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

    $scope.chordProgs = {
        "Don't Stop Believing (I V vi IV)": [
            triads['I'],
            triads['V'],
            triads['vi'],
            triads['IV']
        ],
        'My Sweet Annette (ii IV I V)': [
            triads['ii'],
            triads['IV'],
            triads['I'],
            triads['V']
        ],
        "50's (I vi IV V)": [
            triads['I'],
            triads['vi'],
            triads['IV'],
            triads['V']
        ],
        'Canon (I V vi iii IV I IV V)': [
            triads['I'],
            triads['V'],
            triads['vi'],
            triads['iii'],
            triads['IV'],
            triads['I'],
            triads['IV'],
            triads['V']
        ],
        "Good Love (I IV V IV)": [
            triads['I'],
            triads['IV'],
            triads['V'],
            triads['IV']
        ],
        "Sweet Child (V V IV I)": [
            triads['V'],
            triads['V'],
            triads['IV'],
            triads['I']
        ],
        "Dream On (vi V IV V)": [
            triads['vi'],
            triads['V'],
            triads['IV'],
            triads['V']
        ],
        "Jazz (ii V I Imaj7)": [
            triads['ii'],
            triads['V'],
            triads['I'],
            triads['Imaj7']
        ],
    };

    $scope.octaves = [0, 1, 2, 3, 4, 5];
    $scope.ranges = [1, 2, 3, 4];

    //Configurations
    $scope.selectedOctave = 3;
    $scope.selectedRange = 2;
    $scope.selectedChordProg = $scope.chordProgs["Don't Stop Believing (I V vi IV)"];
    $scope.selectedKey = $scope.keyValues["A"];
    $scope.waveform = $scope.waveforms["sine"];
    $scope.actualRange = $scope.selectedRange * 12;
    $scope.selectedTempo = 100;

    $scope.visualizeChor1 = false;
    $scope.visualizeChor2 = false;
    $scope.visualizeChor3 = false;
    $scope.visualizeMelody = true;

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
    $scope.isRunning = false;

    //All browsers, hooray
    try {
        context = new AudioContext();
    } catch (err) {
        context = new webkitAudioContext();
    }


    $scope.visualSetting = "off";

    var analyser = context.createAnalyser();

    var canvas = document.getElementById('canv');
    var canvasCtx = canv.getContext('2d');

    function visualize() {
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        
        // var visualSetting = visualSelect.value;
        //var visualSetting = "sinewave";
        var visualSetting = $scope.visualSetting;

        console.log(visualSetting);

        if (visualSetting == "sinewave") {
            analyser.fftSize = 2048;
            var bufferLength = analyser.fftSize;
            console.log(bufferLength);
            var dataArray = new Uint8Array(bufferLength);

            canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

            function drawSine() {

                drawVisual = requestAnimationFrame(drawSine);

                analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = 'rgb(200, 200, 200)';
                canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

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

            drawSine();

        } else if (visualSetting == "frequencybars") {
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
        connectOrDisconnect(melody, $scope.visualizeMelody, true);
        connectOrDisconnect(chor1, $scope.visualizeChor1, true);
        connectOrDisconnect(chor2, $scope.visualizeChor2, true);
        connectOrDisconnect(chor3, $scope.visualizeChor3, true);

        //Set type of wave for chord
        chor1.type = chordType;
        chor2.type = chordType;
        chor3.type = chordType;

        //Set type of wave for melody
        melody.type = melodyType;

        melody.frequency.value = base;

        var prog = $scope.selectedChordProg;

        chor1.frequency.value = notes[prog[0][0]];
        chor2.frequency.value = notes[prog[0][1]];
        chor3.frequency.value = notes[prog[0][2]];
    }

    // Build scale
    var buildScale = function () {
        notes = [];
        var freq = base;
        var step = 0;
        for (var i = 0; i < $scope.actualRange; i++) {
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

    //melody function
    var melodyFun = function () {
        var prog = $scope.selectedChordProg;
        time++;
        //chord progression    
        if (time % (notesPerMeasure * (qtrNote / minNote)) == 0 && time != 0) {
            chord++;
            chord %= prog.length;
            chor1.frequency.value = notes[prog[chord][0]];
            chor2.frequency.value = notes[prog[chord][1]];
            chor3.frequency.value = notes[prog[chord][2]];
        }
        //Random note length
        if (time % (Math.floor(Math.random() * (qtrNote / minNote))) == 0) {
            //random note 0 to range-1
            var note = Math.floor((Math.random() * ($scope.actualRange - 1)));

            if (playInKey) {
                var noteMod = note % 12;
                if (noteMod === 1) {
                    note--;
                  //  rest = true;
                }
                else if (noteMod === 3) note++;
                else if (noteMod === 6) note--;
                else if (noteMod === 8) note++;
                else if (noteMod === 10) note--;
            }
            //freq = rest ? 0 : notes[note];
            freq = notes[note];

            //if (rest) {
            //    melody.noteOff(0);
            //} else {
            //    melody.noteOn(0);
            //}

            //attack = 20;
            //decay = 100;

            //if (rest) {
            //    melodyGain.gain.linearRampToValueAtTime(0, context.currentTime + decay/1000);
            //} else if(restLastTime)
            //    melodyGain.gain.linearRampToValueAtTime(0.1, context.currentTime + attack/1000);

            //restLastTime = rest;
            //rest = false;


            melody.frequency.value = freq;

        }
    }

    var beginFunc = function () {
        if (!$scope.isRunning) {
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

            $scope.isRunning = true;
        } else {
            endFunc();
            beginFunc();
        }
    }

    // Click to end the madness
    var endFunc = function () {
        if ($scope.isRunning) {
            chor1.stop(0);
            chor2.stop(0);
            chor3.stop(0);
            melody.stop(0);
            clearInterval(melodyInt);
            $scope.isRunning = false;
        }
    }

    var updateBase = function () {
        base = $scope.selectedKey * Math.pow(2, $scope.selectedOctave);
    }
    var updateWaveformType = function () {
        chordType = $scope.waveform;
        melodyType = $scope.waveform;
    }

    function restart() {
        if ($scope.isRunning) {
            endFunc();
            beginFunc();
        }
    }

    $scope.start = function () { beginFunc(); };
    $scope.end = function () { endFunc(); };

    $scope.updateKey = function (newKey) {
        //hack - select isn't updating the selectedKey via ng-model.  Have to manually set it here
        $scope.selectedKey = newKey;
        restart();
    }

    $scope.updateChordProgression = function (newProg) {
        //hack - select isn't updating the selectedKey via ng-model.  Have to manually set it here
        $scope.selectedChordProg = newProg;
        restart();
    }

    $scope.updateOctave = function (newOctave) {
        $scope.selectedOctave = newOctave;
        restart();
    }

    $scope.updateRange = function (newRange) {
        $scope.seleectedRange = newRange;
        $scope.actualRange = newRange * 12;
        restart();
    }

    $scope.updateTempo = function (newTempo) {
        //  checkBpmInput(newTempo);
        qtrNote = Math.floor(Math.pow(newTempo / 60 / 1000, -1));
        eigthNote = qtrNote / 2;
        minNote = eigthNote;
        restart();
    }
    $scope.updateWaveform = function (newWaveform) {
        $scope.waveform = newWaveform;
        restart();
    }

    $scope.updateVisualization = function () {
        if (drawVisual)
            window.cancelAnimationFrame(drawVisual);

        visualize();
    }
    
    $scope.updateVisualizationMelody = function () {
        connectOrDisconnect(melody, $scope.visualizeMelody);
    }
    $scope.updateVisualizationChor1 = function () {
        connectOrDisconnect(chor1, $scope.visualizeChor1);
    }
    $scope.updateVisualizationChor2 = function () {
        connectOrDisconnect(chor2, $scope.visualizeChor2);
    }
    $scope.updateVisualizationChor3 = function () {
        connectOrDisconnect(chor3, $scope.visualizeChor3);
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

    $scope.resetAll = function () {
        $scope.selectedRange = 2;
        $scope.selectedKey = $scope.keyValues["A"];
        $scope.waveform = $scope.waveforms["sine"];
        $scope.selectedOctave = 3;
        $scope.actualRange = $scope.selectedRange * 12;
        $scope.selectedTempo = 100;
        $scope.updateTempo($scope.selectedTempo);

        $scope.visualSetting = 'off';
        $scope.updateVisualization();
        $scope.visualizeChor1 = false;
        $scope.visualizeChor2 = false;
        $scope.visualizeChor3 = false;
        $scope.visualizeMelody = true;

        restart();
    }
})

