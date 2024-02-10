"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TimeResolvedEvent_1 = __importDefault(require("./TimeResolvedEvent"));
class TimeResolvedTrack {
    constructor(track) {
        let ticks = 0;
        this.events = track.events.map(event => {
            ticks += event.delta;
            return new TimeResolvedEvent_1.default(event, {
                ticks
            });
        });
    }
    injectResolvedSetTempoEvents(events) {
        // NB: Important to unshift these so that the set tempo events come first
        this.events.unshift(...events);
        // TODO: Could speed this up with an insertion sort or something more specific than JS's native sort
        this.events.sort((a, b) => {
            if (a.absolute.ticks === b.absolute.ticks)
                return 0;
            if (a.absolute.ticks > b.absolute.ticks)
                return 1;
            return -1;
        });
    }
}
exports.default = TimeResolvedTrack;
