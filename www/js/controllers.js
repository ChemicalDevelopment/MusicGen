angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeLogin();
        }, 1000);
    };
})


.controller('AboutCtrl', function($scope) {
})

.controller('GenerateCtrl', function($scope) {
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

        $scope.octaves = [0, 1, 2, 3, 4, 5];
        $scope.ranges = [1, 2, 3, 4];

        //Configurations
        $scope.selectedOctave = 3;
        $scope.selectedRange = 2;
        $scope.selectedKey = $scope.keyValues["A"];
        $scope.waveform = $scope.waveforms["sine"];
        $scope.actualRange = $scope.selectedRange * 8;
        $scope.selectedTempo = 100;

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

        //volume
        chordGain = context.createGain();
        melodyGain = context.createGain();
        chordGain.gain.value = 0.05;
        melodyGain.gain.value = 0.1;

        //End Configurations

        init = function() {

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

            //Set type of wave for chord
            chor1.type = chordType;
            chor2.type = chordType;
            chor3.type = chordType;

            //Set type of wave for melody
            melody.type = melodyType;

            melody.frequency.value = base;
            chor1.frequency.value = notes[chordProg[0][0]];
            chor2.frequency.value = notes[chordProg[0][1]];
            chor3.frequency.value = notes[chordProg[0][2]];
        }

        // Build scale
        var buildScale = function() {
            notes = [];
            var freq = base;
            var step = 0;
            for (var i = 0; i < $scope.actualRange; i++) {
                notes[i] = freq
                step++;
                if (i % 7 != 2 && i % 7 != 6) {
                    step++;
                }
                freq = base * Math.pow(a, step);
            }
        }

        //I   V    vi     IV
        //Standard Pop Progression
        chordProg = [
        [0, 2, 4],
        [4, 6, 8],
        [5, 7, 9],
        [3, 5, 7]
        ]

        //melody function
        var melodyFun = function() {
            time++;
            //chord progression    
            if (time % (notesPerMeasure * (qtrNote / minNote)) == 0 && time != 0) {
                chord++;
                chord %= 4
                chor1.frequency.value = notes[chordProg[chord][0]];
                chor2.frequency.value = notes[chordProg[chord][1]];
                chor3.frequency.value = notes[chordProg[chord][2]];
            }
            //Random note length
            if (time % (Math.floor(Math.random() * (qtrNote / minNote))) == 0) {
                //random note 0 to range-1
                var note = Math.floor((Math.random() * ($scope.actualRange - 1)));
                freq = notes[note];
                melody.frequency.value = freq;
            }
        }


        var beginFunc = function() {
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
        var endFunc = function() {
            if ($scope.isRunning) {
                chor1.stop(0);
                chor2.stop(0);
                chor3.stop(0);
                melody.stop(0);
                clearInterval(melodyInt);
                $scope.isRunning = false;
            }
        }

        var updateBase = function() {
            base = $scope.selectedKey * Math.pow(2, $scope.selectedOctave);
        }
        var updateWaveformType = function() {
            chordType = $scope.waveform;
            melodyType = $scope.waveform;
        }

        //function checkBpmInput(ob) {
        //    //var invalidChars = /[^0-9]/gi
        //    //if (invalidChars.test(ob.value)) {
        //    //    ob.value = ob.value.replace(invalidChars, "");
        //    //}
        //    if (ob.value < 40) {
        //        ob.value = 40;
        //    } else if (ob.value > 300) {
        //        ob.value = 300;
        //    }

        //}

        function restart() {
            if ($scope.isRunning) {
                endFunc();
                beginFunc();
            }
        }

        $scope.start = function() { beginFunc(); };
        $scope.end = function() { endFunc(); };

        $scope.updateKey = function (newKey) {
            //hack - select isn't updating the selectedKey via ng-model.  Have to manually set it here
            $scope.selectedKey = newKey;
            restart();
        }
        $scope.updateOctave = function (newOctave) {
            $scope.selectedOctave = newOctave;
            restart();
        }

        $scope.updateRange = function (newRange) {
            $scope.seleectedRange = newRange ;
            $scope.actualRange = newRange * 8;
            restart();
        }

        $scope.updateTempo = function (newTempo) {
          //  checkBpmInput(newTempo);
          qtrNote = Math.floor(Math.pow(newTempo / 60 / 1000, -1));
          eigthNote = qtrNote / 2;
          minNote = eigthNote;
          restart();
      }
      $scope.updateWaveform = function(newWaveform) {
        $scope.waveform = newWaveform;
        restart();
    }
    $scope.resetAll = function() {
        $scope.selectedRange = 2;
        $scope.selectedKey = $scope.keyValues["A"];
        $scope.waveform = $scope.waveforms["sine"];
        $scope.selectedOctave = 3;
        $scope.actualRange = $scope.selectedRange * 8;
        $scope.selectedTempo = 100;
        $scope.updateTempo($scope.selectedTempo);
        //$scope.$apply();

        restart();
    }
})

