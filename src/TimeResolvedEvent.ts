import { Event } from "@perry-rylance/midi";

export type AbsoluteTime = {
	ticks: number;
	milliseconds?: number;
}

export default class TimeResolvedEvent
{
	original: Event;
	absolute: AbsoluteTime;

	constructor(event: Event, absolute: AbsoluteTime = {
		ticks: 0,
		milliseconds: 0
	})
	{
		this.original = event;
		this.absolute = absolute;
	}
}