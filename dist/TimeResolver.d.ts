import { File } from "@perry-rylance/midi";
import TimeResolvedTrack from "./TimeResolvedTrack";
export interface TimeResolverOptions {
    stable?: boolean;
}
export default class TimeResolver {
    private options?;
    readonly tracks: TimeResolvedTrack[];
    constructor(file: File, options?: TimeResolverOptions);
    private injectResolvedSetTempoEvents;
    private indexEvents;
}
