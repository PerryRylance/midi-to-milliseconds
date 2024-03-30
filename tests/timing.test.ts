import { readFileSync } from "fs";
import { ReadStream, File, MarkerEvent, Event } from "@perry-rylance/midi";
import { WaveFile } from "wavefile";

import TimeResolver from "../src/TimeResolver";

const getWav = (filename: string) => {

	const buffer		= readFileSync(filename);

	return new WaveFile(buffer);

}

const getMidi = (filename: string) => {

	const buffer		= readFileSync(filename);

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

test("Reads cue data", () => {

	const wav		= getWav("./tests/files/fantasy-impromptu-with-bar-markers.wav");
	const markers	= wav.listCuePoints();

	expect(markers.length).toBe(140);

});

test("Resolver absolute ticks are sorted", () => {

	const midi		= getMidi("./tests/files/fantasy-impromptu-with-bar-markers.mid");
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

});

test("Resolver events in same order using stable mode", () => {

	const midi		= getMidi("./tests/files/fantasy-impromptu-with-bar-markers.mid");
	const resolver	= new TimeResolver(midi, {stable: true});

	for(let i = 0; i < midi.tracks.length; i++)
	{
		const original = midi.tracks[i].events;
		const resolved = resolver.tracks[i].getEventsBetweenMilliseconds(0, Infinity).map(wrapped => wrapped.original);

		expect(resolved).toStrictEqual(original);
	}

});

test("Resolves expected duration", () => {

	const wav			= getWav("./tests/files/fantasy-impromptu-with-bar-markers.wav");
	const midi			= getMidi("./tests/files/fantasy-impromptu-with-bar-markers.mid");

	const samples		= wav.getSamples();
	const milliseconds	= Math.floor(samples.length / 44100 * 1000);

	const resolver		= new TimeResolver(midi);
	const piano			= resolver.tracks[0];
	const last			= piano.events[piano.events.length - 1];

	expect(last.absolute.milliseconds).toBe(milliseconds);

});

test("Resolves expected bar marker times", () => {

	const wav			= getWav("./tests/files/fantasy-impromptu-with-bar-markers.wav");
	const midi			= getMidi("./tests/files/fantasy-impromptu-with-bar-markers.mid");

	const markers		= wav.listCuePoints();

	const resolver		= new TimeResolver(midi);
	const meta			= resolver.tracks[1];

	// @ts-ignore NB: dwPosition is not on object. Looks like this library is lacking some types.
	const expected	= markers.map(marker => Math.floor(marker.dwPosition / 44100 * 1000))
	const received	= meta
		.events
		.filter(event => event.original instanceof MarkerEvent)
		.map(event => event.absolute.milliseconds);

	expect(received.length).toBe(expected.length);

	for(let i = 0; i < expected.length; i++)	
		expect(received[i]).toBe(expected[i]);

});

test("Gets events between specified millisecond", () => {

	const midi			= getMidi("./tests/files/fantasy-impromptu-with-bar-markers.mid");
	const wav			= getWav("./tests/files/fantasy-impromptu-with-bar-markers.wav");

	// @ts-ignore NB: dwPosition is not on object. Looks like this library is lacking some types.
	const milliseconds	= wav.listCuePoints().map(marker => Math.floor(marker.dwPosition / 44100 * 1000));
	const ticksPerBar	= midi.resolution.ticksPerQuarterNote * 4;

	const resolver		= new TimeResolver(midi);
	const piano			= resolver.tracks[0];

	for(let bar = 0; bar < milliseconds.length - 1; bar++)
	{
		const start		= milliseconds[bar];
		const end		= milliseconds[bar + 1];

		const startTicks = bar * ticksPerBar;
		const endTicks	= (bar + 1) * ticksPerBar;

		const events	= piano.getEventsBetweenMilliseconds(start, end);

		if(events.length === 0)
			continue;

		const first		= events[0];
		const last		= events[events.length - 1];

		expect(first.absolute.ticks).toBeGreaterThanOrEqual(startTicks);
		expect(first.absolute.ticks).toBeLessThanOrEqual(endTicks);
	
		expect(last.absolute.ticks).toBeLessThanOrEqual(endTicks);
		expect(last.absolute.ticks).toBeGreaterThanOrEqual(startTicks);

		// NB: Now get the events in a (less performant) independent way
		const track = midi.tracks[0];
		const expected: Event[] = [];

		for(let i = 0, absolute = 0; i < track.events.length && absolute < endTicks; i++)
		{
			const event = track.events[i];

			absolute += event.delta;

			if(absolute >= startTicks && absolute < endTicks)
				expected.push(event);
		}

		// NB: Relaxed because binary search isn't stable
		expect(events.length).toBe(expected.length);

		for(const event of events)
			expect(expected.indexOf(event.original)).toBeGreaterThan(-1);

		const eventsByTicks = piano.getEventsBetweenTicks(startTicks, endTicks);

		expect(eventsByTicks.length).toBe(expected.length);

		for(const event of eventsByTicks)
			expect(expected.indexOf(event.original)).toBeGreaterThan(-1);
	}

});
