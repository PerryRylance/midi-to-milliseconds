import { File, SetTempoEvent, ResolutionUnits, Event, NoteOnEvent } from "@perry-rylance/midi";
import TimeResolvedTrack from "./TimeResolvedTrack";
import TimeResolvedEvent from "./TimeResolvedEvent";
import InjectedSetTempoEvent from "./InjectedSetTempoEvent";

export default class TimeResolver
{
	readonly tracks: TimeResolvedTrack[];

	constructor(file: File)
	{
		if(file.resolution.units !== ResolutionUnits.PPQ)
			throw new Error("Only PPQ resolution is supported presently");

		// NB: Get absolute ticks for all events
		this.tracks = file.tracks.map(track => new TimeResolvedTrack(track));

		// NB: Get resolved tempo events from all tracks
		const resolvedSetTempoEvents: TimeResolvedEvent[] = this.tracks.map(track => {

			return track.events.filter(event => event.original instanceof SetTempoEvent) as TimeResolvedEvent[];

		})
			.flat();
		
		// NB: Inject the tempo events into each track
		for(const track of this.tracks)
			this.injectResolvedSetTempoEvents(track, resolvedSetTempoEvents);

		// NB: Walk the events for each track resolving time
		const ppqn = file.resolution.ticksPerQuarterNote;

		let trackIndex = 0;

		for(const track of this.tracks)
		{
			let milliseconds = 0;
			let bpm = 120;
			let prev: TimeResolvedEvent | null = null;

			for(const event of track.events)
			{
				// NB: Deltas won't work here because we've injected set tempos. Need to track our own delta from absolute times.
				const delta = event.absolute.ticks - (prev ? prev.absolute.ticks : 0);

				milliseconds += delta * 60000 / ppqn / bpm;

				// NB: Round down to avoid floating-point comparison issues. Milliseconds is accurate enough for the purposes of this library.
				event.absolute.milliseconds = Math.floor(milliseconds);

				if(event.original instanceof SetTempoEvent)
					bpm = event.original.bpm;

				prev = event;
			}

			trackIndex++;

		}
	}

	private injectResolvedSetTempoEvents(track: TimeResolvedTrack, events: TimeResolvedEvent[]): void
	{
		const cloned = events.map(event => {

			const cloned = new InjectedSetTempoEvent(event.original.delta);
			cloned.bpm = (event.original as SetTempoEvent).bpm;
			
			return new TimeResolvedEvent(cloned, event.absolute);

		});

		// NB: Important to unshift these so that the set tempo events come first
		track.events.unshift(...cloned);

		// TODO: Could speed this up with an insertion sort or something more specific than JS's native sort
		track.events.sort((a, b) => {

			if(a.absolute.ticks === b.absolute.ticks)
				return 0;

			if(a.absolute.ticks > b.absolute.ticks)
				return 1;

			return -1;

		});
	}
}