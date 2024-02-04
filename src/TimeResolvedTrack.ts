import { Event, Track, SetTempoEvent } from "@perry-rylance/midi";
import TimeResolvedEvent from "./TimeResolvedEvent";

export default class TimeResolvedTrack
{
	events: TimeResolvedEvent<Event>[];

	constructor(track: Track)
	{
		let ticks = 0;

		this.events = track.events.map(event => {

			ticks += event.delta;

			return new TimeResolvedEvent(event, {
				ticks
			});

		});
	}

	injectResolvedSetTempoEvents(events: TimeResolvedEvent<SetTempoEvent>[]): void
	{
		// NB: Important to unshift these so that the set tempo events come first
		this.events.unshift(...events);

		// TODO: Could speed this up with an insertion sort or something more specific than JS's native sort
		this.events.sort((a, b) => {

			if(a.absolute.ticks === b.absolute.ticks)
				return 0;

			if(a.absolute.ticks > b.absolute.ticks)
				return 1;

			return -1;

		});
	}
}