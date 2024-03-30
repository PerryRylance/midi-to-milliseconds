import { Track } from "@perry-rylance/midi";
import TimeResolvedEvent from "./TimeResolvedEvent";
import { TimeResolverOptions } from "./TimeResolver";
export default class TimeResolvedTrack {
    events: TimeResolvedEvent[];
    private millisecondsBinaryTree;
    private ticksBinaryTree;
    private options?;
    constructor(track: Track, options?: TimeResolverOptions);
    private getEventsBetween;
    private stripInjectedSetTempoEvents;
    getEventsBetweenTicks(start: number, end: number): TimeResolvedEvent[];
    getEventsBetweenMilliseconds(start: number, end: number): TimeResolvedEvent[];
}
