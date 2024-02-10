import { Event, Track, SetTempoEvent } from "@perry-rylance/midi";
import TimeResolvedEvent from "./TimeResolvedEvent";
export default class TimeResolvedTrack {
    events: TimeResolvedEvent<Event>[];
    constructor(track: Track);
    injectResolvedSetTempoEvents(events: TimeResolvedEvent<SetTempoEvent>[]): void;
}
