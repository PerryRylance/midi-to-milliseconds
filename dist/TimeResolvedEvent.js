"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TimeResolvedEvent {
    constructor(event, absolute = {
        ticks: 0,
        milliseconds: 0
    }) {
        this.original = event;
        this.absolute = absolute;
    }
}
exports.default = TimeResolvedEvent;
