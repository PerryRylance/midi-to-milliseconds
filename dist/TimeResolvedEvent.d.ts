import { Event } from "@perry-rylance/midi";
export type AbsoluteTime = {
    ticks: number;
    milliseconds?: number;
};
export default class TimeResolvedEvent {
    index?: number;
    original: Event;
    absolute: AbsoluteTime;
    constructor(event: Event, absolute?: AbsoluteTime);
}
