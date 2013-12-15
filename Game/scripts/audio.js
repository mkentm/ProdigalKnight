webkitAudioContext.prototype.loadSound = function (url, strNameOfSoundBufferVariable) {
    this.prepareRequest(url, strNameOfSoundBufferVariable);
};

webkitAudioContext.prototype.prepareRequest = function (url, strNameOfSoundBufferVariable) {
    var context = this;
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        context.decodeAudioData(request.response, function (buffer) {
            context.buffers[strNameOfSoundBufferVariable] = buffer;
        }, onError);
    };
    request.send();
};

function onError() {
}

webkitAudioContext.prototype.buffers = {};

webkitAudioContext.prototype.playSound = function (strBuffer, toggle) {
    if (toggle) {
        var context = this;
        var buffer = this.buffers[strBuffer];
        var source = context.createBufferSource(); // creates a sound source
        source.buffer = buffer;                    // Give the Source some PCM data to be played
        source.connect(context.destination);       // connect the audio source the speakers
        source.noteOn(0);                          // play the audio source zero seconds from now
    }
};

var audio = new webkitAudioContext();
// bonus
audio.loadSound('audio/bonus.ogg', 'coin');

// level start
audio.loadSound('audio/start.wav', 'start');

// clicks
audio.loadSound('audio/click.ogg', 'click');

// success
audio.loadSound('audio/success.ogg', 'success');

// failure
audio.loadSound('audio/failure.ogg', 'failure');

// mana
audio.loadSound('audio/mana.ogg', 'mana');

// teleport
audio.loadSound('audio/teleport.wav', 'teleport');