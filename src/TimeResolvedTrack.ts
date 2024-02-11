import { Event, Track } from "@perry-rylance/midi";
import TimeResolvedEvent, { AbsoluteTime } from "./TimeResolvedEvent";
import InjectedSetTempoEvent from "./InjectedSetTempoEvent";
// @ts-ignore
import d3 from "../node_modules/d3-binarytree/dist/d3-binarytree";

export default class TimeResolvedTrack
{
	events: TimeResolvedEvent[];

	private millisecondsBinaryTree: any;
	private ticksBinaryTree: any;

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

	private getEventsBetween(start: number, end: number, key: keyof AbsoluteTime): TimeResolvedEvent[]
	{
		if(this.events.length === 0)
			return [];

		const results: TimeResolvedEvent[] = [];

		let tree: any = null;

		switch(key)
		{
			case "milliseconds":

				if(!this.millisecondsBinaryTree)
					this.millisecondsBinaryTree = d3.binarytree(this.events, (node: TimeResolvedEvent) => node.absolute.milliseconds);

				tree = this.millisecondsBinaryTree;

				break;
			
			case "ticks":

				if(!this.ticksBinaryTree)
					this.ticksBinaryTree = d3.binarytree(this.events, (node: TimeResolvedEvent) => node.absolute.ticks);

				tree = this.ticksBinaryTree;
				
				break;

			default:
				throw new Error("Invalid key");
		}

		tree.visit((node: any, x1: number, x2: number) => {
			if(!node.length) {
				do{
					const d = node.data;
					const x = tree.x()(d);

					if(x >= start && x < end)
						results.push(d);
				
				}while(node = node.next);
			}

			return x1 >= end || x2 < start;
		});

		return this.stripInjectedSetTempoEvents(results);
	}

	private stripInjectedSetTempoEvents(events: TimeResolvedEvent[]): TimeResolvedEvent[]
	{
		return events.filter(event => !(event.original instanceof InjectedSetTempoEvent));
	}

	getEventsBetweenTicks(start: number, end: number): TimeResolvedEvent[]
	{
		return this.getEventsBetween(start, end, "ticks");
	}

	getEventsBetweenMilliseconds(start: number, end: number): TimeResolvedEvent[]
	{
		return this.getEventsBetween(start, end, "milliseconds");
	}
}