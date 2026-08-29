---
id: area
description: "A place where things can be — a container with exits to other areas."
defines: area
aliases: [areas, room, rooms, place, location]
extends: container
contains: [object, person]
date-created: 2026-03-29
date-modified: 2026-03-29
---

An area is a place where things can be. A room, a field, a street corner, a clearing in a forest, a ship's deck, a webpage — all areas. TAB defines an area as "a [container](container.md) with exits." That's the whole idea: an area holds things, and it connects to other areas through exits.

An area has contents — the things currently in it. A kitchen contains a table, chairs, dishes, a person cooking. A park contains trees, benches, people, squirrels. The contents change as things arrive and leave. The area persists.

An area has exits — connections to other areas. A room has a door to the hallway. The hallway has stairs to the floor above. The floor above has a window to the roof. Exits are named and directional: "north," "the front door," "upstairs," "through the gate." The network of areas connected by exits is a map.

An area can be described. When you enter a room, you see it: the size, the lighting, what's in it, where the exits are. Description is how an area communicates itself to someone arriving. In a MUD, the description is text. In physical space, the description is what you perceive. Either way, the area presents itself as a whole — not a list of attributes but a scene.

Areas contain lookables and noises — things that are part of the area's character but not separate objects you can pick up. The painting on the wall, the sound of traffic, the smell of bread baking. These are details that make the area a place rather than an empty container.

The difference between an area and a plain container: a container holds things, but an area is somewhere you can BE. A box holds books; you are not "in" the box in any meaningful sense. A room holds furniture; you are in the room. Areas are containers scaled to the size of experience — places where people exist and act.

Areas nest. A building contains rooms. A city contains buildings. A country contains cities. At each level, the area contains smaller areas as well as objects and people. The nesting is the structure of space as people experience it — not geometric coordinates but places-inside-places, connected by passages.
