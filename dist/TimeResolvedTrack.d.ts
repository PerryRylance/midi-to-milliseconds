import { Track } from "@perry-rylance/midi";
import TimeResolvedEvent from "./TimeResolvedEvent";
export default class TimeResolvedTrack {
    events: TimeResolvedEvent[];
    private millisecondsBinaryTree;
    private ticksBinaryTree;
    constructor(track: Track);
    private getEventsBetween;
    private stripInjectedSetTempoEvents;
    getEventsBetweenTicks(start: number, end: number): TimeResolvedEvent[];
    getEventsBetweenMilliseconds(start: number, end: number): TimeResolvedEvent[];
}
