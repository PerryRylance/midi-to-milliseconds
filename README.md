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

## Stability
By default, `getEventsBetweenMilliseconds` and `getEventsBetweenTicks` are __not stable__. They will return the events between the specified start and end, however the events will not necessarily be in their original order.

For applications that only care about which events occured and not what order they occured in, this is fine. For example, a visual application that only cares about note on events on the current frame may not care what order those events are retrieved in.

For applications that __must preserve the order of events__ please initialize the `TimeResolver` with `{stable: true}` as the options argument. At a slight performance cost, this will guarantee events are returned in the same order they appeared in the original MIDI file. This is useful for accuracy-critial applications such as realtime MIDI playback.

Under the hood, this library uses `d3-binarytree` to very quickly find events between specified times. This is not stable. When passing `true` for the `stable` option, this library will keep an index of the events and use JavaScript's `sort` before returning events between specified times.