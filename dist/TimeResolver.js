"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const midi_1 = require("@perry-rylance/midi");
const TimeResolvedTrack_1 = __importDefault(require("./TimeResolvedTrack"));
const TimeResolvedEvent_1 = __importDefault(require("./TimeResolvedEvent"));
const InjectedSetTempoEvent_1 = __importDefault(require("./InjectedSetTempoEvent"));
class TimeResolver {
    constructor(file, options) {
        var _a;
        if (file.resolution.units !== midi_1.ResolutionUnits.PPQ)
            throw new Error("Only PPQ resolution is supported presently");
        this.options = options;
        // NB: Get absolute ticks for all events
        this.tracks = file.tracks.map(track => new TimeResolvedTrack_1.default(track, options));
        // NB: Get resolved tempo events from all tracks
        const resolvedSetTempoEvents = this.tracks.map(track => {
            return track.events.filter(event => event.original instanceof midi_1.SetTempoEvent);
        })
            .flat();
        // NB: Inject the tempo events into each track
        for (const track of this.tracks) {
            this.injectResolvedSetTempoEvents(track, resolvedSetTempoEvents);
            if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.stable)
                this.indexEvents(track);
        }
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
                // NB: Round down to avoid floating-point comparison issues. Milliseconds is accurate enough for the purposes of this library.
                event.absolute.milliseconds = Math.floor(milliseconds);
                if (event.original instanceof midi_1.SetTempoEvent)
                    bpm = event.original.bpm;
                prev = event;
            }
            trackIndex++;
        }
    }
    injectResolvedSetTempoEvents(track, events) {
        const cloned = events.map(event => {
            const cloned = new InjectedSetTempoEvent_1.default(event.original.delta);
            cloned.bpm = event.original.bpm;
            return new TimeResolvedEvent_1.default(cloned, event.absolute);
        });
        // NB: Important to unshift these so that the set tempo events come first
        track.events.unshift(...cloned);
        // TODO: Could speed this up with an insertion sort or something more specific than JS's native sort
        track.events.sort((a, b) => {
            if (a.absolute.ticks === b.absolute.ticks)
                return 0;
            if (a.absolute.ticks > b.absolute.ticks)
                return 1;
            return -1;
        });
    }
    indexEvents(track) {
        for (let i = 0; i < track.events.length; i++)
            track.events[i].index = i;
    }
}
exports.default = TimeResolver;
