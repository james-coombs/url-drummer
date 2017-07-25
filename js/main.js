// Init AudioContext
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

function urlDrummer() {
	// Get the current tab's URL and reduce it to only letters
	chrome.tabs.getSelected(null, function(tab) {
		var urlChars = tab.url.replace(/(http.)|([\W \d \s _])/g, '').toLowerCase();
		console.log(urlChars);

		// Start BufferLoader //
		function BufferLoader(context, urlList, callback) {
			this.context = context;
			this.urlList = urlList;
			this.onload = callback;
			this.bufferList = [];
			this.loadCount = 0;
		}

		BufferLoader.prototype.loadBuffer = function(url, index) {
			// Load buffer asynchronously
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';

			var loader = this;

			request.onload = function() {
				// Asynchronously decode the audio file data in request.response
				loader.context.decodeAudioData(
					request.response,
					function(buffer) {
						if (!buffer) {
							console.log('error decoding file data: ' + url);
							return;
						}
						loader.bufferList[index] = buffer;
						if (++loader.loadCount == loader.urlList.length)
							loader.onload(loader.bufferList);
					},
					function(error) {
						console.error('decodeAudioData error', error);
					}
				);
			};

			request.onerror = function() {
				console.error('BufferLoader: XHR error');
			};

			request.send();
		};

		BufferLoader.prototype.load = function() {
			for (var i = 0; i < this.urlList.length; ++i)
				this.loadBuffer(this.urlList[i], i);
		};
		// End BufferLoader //

		var bufferLoader;

		function init() {
			// Init BufferLoader w/samples and call finishedLoading
			bufferLoader = new BufferLoader(
				context,
				[
					'/samples/a.mp3', '/samples/b.mp3', '/samples/c.mp3', '/samples/d.mp3', '/samples/e.mp3', '/samples/f.mp3', '/samples/g.mp3', '/samples/h.mp3',
					'/samples/i.mp3', '/samples/j.mp3', '/samples/k.mp3', '/samples/l.mp3', '/samples/m.mp3', '/samples/n.mp3', '/samples/o.mp3', '/samples/p.mp3',
					'/samples/q.mp3', '/samples/r.mp3', '/samples/s.mp3', '/samples/t.mp3', '/samples/u.mp3', '/samples/v.mp3', '/samples/w.mp3', '/samples/x.mp3',
					'/samples/y.mp3', '/samples/z.mp3'
				],
				finishedLoading
			);

			bufferLoader.load();
		}

		// Create buffers and connect to source to play
		function playSound(buffer, time) {
			var source = context.createBufferSource();
			source.buffer = buffer;
			source.connect(context.destination);
			source.start(time);
		}

		// Runs after BufferLoader loads, plays selected samples in rhythm
		function finishedLoading(bufferList) {
			var codedUrl = [];
			var beatsToPlay = [];
			var charCodeSamples = {
				97 : bufferList[0],
				98 : bufferList[1],
				99 : bufferList[2],
				100 : bufferList[3],
				101 : bufferList[4],
				102 : bufferList[5],
				103 : bufferList[6],
				104 : bufferList[7],
				105 : bufferList[8],
				106 : bufferList[9],
				107 : bufferList[10],
				108 : bufferList[11],
				109 : bufferList[12],
				110 : bufferList[13],
				111 : bufferList[14],
				112 : bufferList[15],
				113 : bufferList[16],
				114 : bufferList[17],
				115 : bufferList[18],
				116 : bufferList[19],
				117 : bufferList[20],
				118 : bufferList[21],
				119 : bufferList[22],
				120 : bufferList[23],
				121 : bufferList[24],
				122 : bufferList[25],
			};

			// Create array of Unicode values of URL chars
			for (var i = 0; i < urlChars.length; i++) {
				codedUrl.push(urlChars.charCodeAt(i));
			}

			// Loop over codedUrl and compare values with charCodeSamples
			Object.keys(codedUrl).forEach(function(key) {
				// If the codedUrl value is found in charCodeSamples, add it to an array of beats
				if (charCodeSamples.hasOwnProperty(codedUrl[key]) === true) {
					var beat = charCodeSamples[codedUrl[key]];

					beatsToPlay.push(beat);
				}
			});

			var startTime = context.currentTime + 0.100; // Delay play start time
			var tempo = 80; // BPM
			var quarterNoteTime = 20 / tempo;
			console.log('quarterNoteTime is: ' + quarterNoteTime);

			for (var j = 0; j < beatsToPlay.length; j++) {
				playSound(beatsToPlay[j], startTime + j * 0.15 + quarterNoteTime);
			}
		}

		init();
	});
}

chrome.browserAction.onClicked.addListener(function(tab) { // Start script on icon click
	urlDrummer();
});
