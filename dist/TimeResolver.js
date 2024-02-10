"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const midi_1 = require("@perry-rylance/midi");
const TimeResolvedTrack_1 = __importDefault(require("./TimeResolvedTrack"));
class TimeResolver {
    constructor(file) {
        if (file.resolution.units !== midi_1.ResolutionUnits.PPQ)
            throw new Error("Only PPQ resolution is supported presently");
        // NB: Get absolute ticks for all events
        this.tracks = file.tracks.map(track => new TimeResolvedTrack_1.default(track));
        // NB: Get resolved tempo events from all tracks
        const resolvedSetTempoEvents = this.tracks.map(track => {
            return track.events.filter(event => event.original instanceof midi_1.SetTempoEvent);
        })
            .flat();
        // NB: Inject the tempo events into each track
        for (const track of this.tracks)
            track.injectResolvedSetTempoEvents(resolvedSetTempoEvents);
        // NB: Walk the events for each track resolving time
        const ppqn = file.resolution.ticksPerQuarterNote;
        let trackIndex = 0;
        for (const track of this.tracks) {
            let milliseconds = 0;
            let bpm = 120;
            let prev = null;
            for (const event of track.events) {
                // NB: Deltas won't work here because we've injected set tempos. Need to track our own delta from absolute times.
                const delta = event.absolute.ticks - (prev ? prev.absolute.ticks : 0);
                milliseconds += delta * 60000 / ppqn / bpm;
                event.absolute.milliseconds = milliseconds;
                if (event.original instanceof midi_1.SetTempoEvent)
                    bpm = event.original.bpm;
                prev = event;
            }
            trackIndex++;
        }
    }
}
exports.default = TimeResolver;
