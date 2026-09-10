---

title: Teraum'S Mud Stack
date-created: "2020-01-05T00:00:00"
---

In this post I'd like to explain the “MUD stack” behind Teraum, what each one is as a project and how they relate.

**_Teraum_** is a _MUD server_ running the **Racket-MUD** _engine_ loaded with the **RPG-Basics** _library_ and a custom _map_.

Phew! Lot of terms.

- A **_MUD server_** is a single MUD, running somewhere. Folk can connect to it, create accounts, and do whatever that server allows.
    
- A **_MUD engine_** is a piece of software that provides the game engine for running a MUD server. It usually doesn't come with too many game-like features itself, usually focused around providing connectivity and utilities.
    
- A **_MUD library_** is a collection of code meant to be added into a *MUD engine to extend its features.
    

There's our generic terms.

- **_Racket-MUD_** is a _MUD engine_ that's made by the same people who are making **Teraum**. It's written in the _Racket_ programming language. It's about two hours older than the Teraum MUD, so is also in the very early stages of development.
    
- **_RPG-Basics_** is a _MUD library_ that's being made by us same folk who are making **Teraum** and **Racket-MUD**. It's the first _library_ being made for **Racket-MUD**, and as such, its code isn't well-segregated from the _engine_.
    

Under-the-hood, the _engine_ is just a procedure for handling the scheduling and sequential calling of **_events_**, another type of procedure for manipulating the state of the game world. When the engine is `made`, it's usually passed a list of _events_ to call when it first starts. For example, **Racket-MUD** comes bundled with _events_ for creating, loading, and saving user accounts, managing intra-engine user chat channels, and running the socket server to which those users will connect.

A _library_ is a similar bundle of _events_. The **RPG-Basics** _library_ currently provides events that load the world map and set up the ability for those created things to randomly act.

In practice, starting the MUD is done with the following line of Racket:

```racket
(run-engine
 (make-engine "Teraum"
  (list (accounts)
        (mudsocket)
        (talker)
        (actions)
        (mudmap teraum-map))))
```

---

As **Teraum** increases in sophistication, the number of _events_ passed when the _engine_ is `made` will steadily increase, but the basic concept is there: pass a list of procedures to the engine to serve as the first _events_.

In follow-up posts, I plan on explaining how each of these events work, and providing a more thorough explanation of what `making` an _engine_ actually means. Also, what goes into the `teraum-map`: how are in-game things represented, as source code.