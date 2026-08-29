---
date: "[[2020-01-05]]"
authors:
  - "[[emsenn]]"
---
**_Teraum_** is a tragically funny fantasy multiplayer role-playing game, played through text: players type commands and receive text output in response:

```
> look
[Crossed Candles Inn]
This is the Crossed Candles Inn: a simple wooden shack with several shuttered windows. There are a few wooden cots in one corner, and a long table which serves as the bar in another. There are some people seated at the table. A door leads out to Arathel County.
Contents: emsenn and Lexandra Terr
Exits: out

> move out

You attempt to move out

[Turnwise Road, South Arathel, Greater Ack Metropolitan Enclosure, outside Crossed Candles Inn]
This is an area of the Turnwise Road, a circular road...
```

(This type of text-based MMORPG is called a _MUD_.)

This blog will be where we (the development team) share updates about the game's progress, until we have a blog set up within the MUD.

In this first post, we'd like to explain to you a little bit about the project, our plans for its future, and how y'all might get involved if you're interested.

---

Teraum is a fantasy setting created by [emsenn](https://emsenn.net/) in the early 2000s, when they were a child. Since then it's been the setting of various short stories, tabletop RPG campaigns, and even a podcast. It's a world that used to have magic, but now doesn't: it's probably the most mundane fantasy setting you'll ever learn about.

Teraum is currently being implemented as a **_MUD_**, or multi-user dimension: a text-based multiplayer online role-playing game. In it, players can become a human living on Teraum, in approximately the 8th decade after the Break(, when magic went away.)

The MUD is being implemented using a custom MUD engine being written from the ground-up in Racket. While Teraum's source code is closed, so people have to actually play the game, the MUD engine's source [is available](https://gitlab.com/emsenn/racket-mud).

Right now, the MUD doesn't have very many features. There are a bit more than fifty rooms you can walk around, representing some areas of the Old World, mostly centered around the Green Delta. That's about it: you can walk around.

In the immediate future, most of the development team's focus will be on developing the engine's features, while we plan what gameplay within the MUD might look like. (Adding colourful output, properly handling unicode, stuff like that.)

---

We want gameplay in Teraum to be meaningful, even bordering on moralistic. Conflict and combat aren't going to be prioritized; the latter might not ever be implemented. Instead, the gameplay is going to try and pit players against a turbulent game world, where the actions of things out of their control force them to perpetually adapt.

...The apples from Wultha never arrived. The Red Union puts out a notice, and players head to the the small remote town to `investigate`. It has been burnt down. Commercial interests begin to reconstruct the town. A small boom occurs along the route between those interests and the town. Players find opportunities for work: importing and exporting, helping `build`, `repair`, widen roads. Find their place in the situation, only for it to change again.

The world will not just need `exploration` but `examination` and `analysis`. Seasonal goods collected, roofs repaired before the spring showers come. Life is hard, even when no one's making it that way, but that doesn't make life bad.

---

How can you get involved? Teraum is looking for developers to help work on the Racket-MUD engine, as well as writers to help implement game areas. We're not yet ready for playtesters, but we'll be wanting them when we are!

If you want to get involved now, please send am email to [emsenn+teraum@emsenn.net](mailto:emsenn+teraum@emsenn.net).

Otherwise I recommend following this blog's [RSS feed] or through the Fediverse at **[@teraum@write.as](https://teraum.writeas.com/@/teraum@write.as)**