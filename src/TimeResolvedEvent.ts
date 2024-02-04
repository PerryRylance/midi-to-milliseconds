import { Event } from "@perry-rylance/midi";

type AbsoluteTime = {
	ticks: number;
	milliseconds?: number;
}

export default class TimeResolvedEvent<T extends Event>
{
	original: T;
	absolute: AbsoluteTime;

	constructor(event: T, absolute: AbsoluteTime = {
		ticks: 0,
		milliseconds: 0
	})
	{
		this.original = event;
		this.absolute = absolute;
	}
}