# MIDI to milliseconds
This library provides a `TimeResolver` class that yields `TimeResolvedTrack`s and `TimeResolvedEvent`s from a MIDI file.

For use with [this MIDI package](https://github.com/perryrylance/midi).

## Installation
`npm install @perry-rylance/midi-to-milliseconds`

## Usage
You'll need a MIDI file with one or more tracks loaded up, see [@perry-rylance/midi](https://www.npmjs.com/package/@perry-rylance/midi).

```
const resolver = new TimeResolver(midi);
const track = resolver.tracks[0];
const events = track.getEventsBetweenMilliseconds(0, 1000);
```

`events` will be an array of `TimeResolvedEvent` objects, containing the events resolved absolute ticks and milliseconds in `absolute` and the original event in `original`.

This is useful for tasks such as syncing animations to MIDI. If track milliseconds for the previous frame versus milliseconds at the time now for example, you can retrieve a list of MIDI events that occured within that frame. From there you can do something like animate objects based on the events.

## Notes
__It is important to note__ that the "get events between" functions such as `getEventsBetweenMilliseconds` __is not stable__ in the sense that whilst it is accurate, the events it gives you back will not necessarily be in order.