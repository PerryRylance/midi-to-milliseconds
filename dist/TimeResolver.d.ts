import { File } from "@perry-rylance/midi";
import TimeResolvedTrack from "./TimeResolvedTrack";
export default class TimeResolver {
    readonly tracks: TimeResolvedTrack[];
    constructor(file: File);
    private injectResolvedSetTempoEvents;
}
