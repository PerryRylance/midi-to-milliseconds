import { Event } from "@perry-rylance/midi";
type AbsoluteTime = {
    ticks: number;
    milliseconds?: number;
};
export default class TimeResolvedEvent<T extends Event> {
    original: T;
    absolute: AbsoluteTime;
    constructor(event: T, absolute?: AbsoluteTime);
}
export {};
