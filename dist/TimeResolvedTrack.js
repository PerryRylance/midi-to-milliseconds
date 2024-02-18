"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TimeResolvedEvent_1 = __importDefault(require("./TimeResolvedEvent"));
const InjectedSetTempoEvent_1 = __importDefault(require("./InjectedSetTempoEvent"));
// @ts-ignore
const binarytree_1 = __importDefault(require("../lib/d3-binarytree/binarytree"));
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
    getEventsBetween(start, end, key) {
        if (this.events.length === 0)
            return [];
        const results = [];
        start = Math.floor(start);
        end = Math.floor(end);
        let tree = null;
        switch (key) {
            case "milliseconds":
                if (!this.millisecondsBinaryTree)
                    this.millisecondsBinaryTree = (0, binarytree_1.default)(this.events, (node) => node.absolute.milliseconds);
                tree = this.millisecondsBinaryTree;
                break;
            case "ticks":
                if (!this.ticksBinaryTree)
                    this.ticksBinaryTree = (0, binarytree_1.default)(this.events, (node) => node.absolute.ticks);
                tree = this.ticksBinaryTree;
                break;
            default:
                throw new Error("Invalid key");
        }
        tree.visit((node, x1, x2) => {
            if (!node.length) {
                do {
                    const d = node.data;
                    const x = tree.x()(d);
                    if (x >= start && x < end)
                        results.push(d);
                } while (node = node.next);
            }
            return x1 >= end || x2 < start;
        });
        return this.stripInjectedSetTempoEvents(results);
    }
    stripInjectedSetTempoEvents(events) {
        return events.filter(event => !(event.original instanceof InjectedSetTempoEvent_1.default));
    }
    getEventsBetweenTicks(start, end) {
        return this.getEventsBetween(start, end, "ticks");
    }
    getEventsBetweenMilliseconds(start, end) {
        return this.getEventsBetween(start, end, "milliseconds");
    }
}
exports.default = TimeResolvedTrack;
