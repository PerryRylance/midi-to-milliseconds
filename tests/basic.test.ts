import { ReadStream, File, NoteOnEvent } from "@perry-rylance/midi";
import { WaveFile } from "wavefile";

import TimeResolver from "../src/TimeResolver";

const getWav = (filename: string) => {

	const fs			= require("fs");
	const buffer		= fs.readFileSync(filename);

	return new WaveFile(buffer);

}

const getMidi = (filename: string) => {

	const fs			= require("fs");
	const buffer		= fs.readFileSync(filename);

	// NB: For some reason, on my machine, trying to get .buffer from the result of readFileSync gives a buffer 8192 bytes in length when I'm reading a file 293 bytes in length, it contains data not present in the file. So we need to convert here. See https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
	const arrayBuffer	= new ArrayBuffer(buffer.length);
	const view			= new Uint8Array(arrayBuffer);

	for(let i = 0; i < buffer.length; i++)
		view[i] = buffer[i];

	const stream	= new ReadStream(arrayBuffer);
	const midi		= new File();

	midi.readBytes(stream);

	return midi;

};

/* test("Reads cue data", () => {

	const wav		= getWav("./tests/files/basic.wav");
	const markers	= wav.listCuePoints();

	expect(markers.length).toBe(96);

});

test("Resolver absolute ticks are sorted", () => {

	const midi		= getMidi("./tests/files/basic.mid");
	const resolver	= new TimeResolver(midi);

	for(const track of resolver.tracks)
	{
		const sorted = [...track.events].sort((a, b) => {

			if(a.absolute.ticks === b.absolute.ticks)
				return 0;

			if(a.absolute.ticks > b.absolute.ticks)
				return 1;

			return -1;

		});

		expect(track.events).toStrictEqual(sorted);
	}

}); */

/* test("Resolves expected duration", () => {

	const wav			= getWav("./tests/files/basic.wav");
	const midi			= getMidi("./tests/files/basic.mid");

	const samples		= wav.getSamples();
	const milliseconds	= samples.length / 44100 * 1000;

	const resolver		= new TimeResolver(midi);
	const piano			= resolver.tracks[1];
	const last			= piano.events[piano.events.length - 1];

	expect(last.absolute.milliseconds).toBeCloseTo(milliseconds, 6);

}); */

test("Resolves expected note on start times", () => {

	const wav			= getWav("./tests/files/basic.wav");
	const midi			= getMidi("./tests/files/basic.mid");

	const markers		= wav.listCuePoints();

	const resolver		= new TimeResolver(midi);
	const piano			= resolver.tracks[1];

	// @ts-ignore NB: dwPosition is not on object. Looks like this library is lacking some types.
	const expected		= markers.map(marker => marker.dwPosition / 44100 * 1000)
	const received		= piano
		.events
		.filter(event => event.original instanceof NoteOnEvent)
		.map(event => event.absolute.milliseconds);

	expect(received).toStrictEqual(expected);

});