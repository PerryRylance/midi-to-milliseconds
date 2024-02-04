import { File, SetTempoEvent, ResolutionUnits, Event, NoteOnEvent } from "@perry-rylance/midi";
import TimeResolvedTrack from "./TimeResolvedTrack";
import TimeResolvedEvent from "./TimeResolvedEvent";

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
		const resolvedSetTempoEvents: TimeResolvedEvent<SetTempoEvent>[] = this.tracks.map(track => {

			return track.events.filter(event => event.original instanceof SetTempoEvent) as TimeResolvedEvent<SetTempoEvent>[];

		})
			.flat();
		
		// NB: Inject the tempo events into each track
		for(const track of this.tracks)
			track.injectResolvedSetTempoEvents(resolvedSetTempoEvents);

		// NB: Walk the events for each track resolving time
		const ppqn = file.resolution.ticksPerQuarterNote;

		let trackIndex = 0;

		for(const track of this.tracks)
		{
			

			let milliseconds = 0;
			let bpm = 120;
			let prev: TimeResolvedEvent<Event> | null = null;

			let index = 0;
			let noteOnIndex = 0;

			for(const event of track.events)
			{
				


				// NB: Deltas won't work here because we've injected set tempos. Need to track our own delta from absolute times.
				const delta = event.absolute.ticks - (prev ? prev.absolute.ticks : 0);

				milliseconds += delta * 60000 / ppqn / bpm;

				event.absolute.milliseconds = milliseconds;

				if(event.original instanceof SetTempoEvent)
				{
					bpm = event.original.bpm;

					if(trackIndex === 1)
						console.log(`New bpm is ${bpm}`);
				}

				

					if(trackIndex === 1)
					{
						console.log(`Event ${index} has delta ${delta} an absolute time ${event.absolute.ticks}`, event);
						index++;

						if(event.original instanceof NoteOnEvent)
							noteOnIndex++;
					}
	



				prev = event;
			}

			trackIndex++;

		}
	}
}