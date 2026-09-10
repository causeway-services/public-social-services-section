---
date: "[[2020-01-11]]"
---
For other discussion about the development of Teraum, try following [@TeraumDev@gup.pe](https://teraum.writeas.com/@/TeraumDev@gup.pe)

In this post I'd like to explain how the `(actions)` event works. It grew out of the “Actions Service,” which is kind of a defunct concept now that _Racket-MUD_ has gotten more _functional_.

Services were features loaded into the MUD as it loaded, and some of them provided `(tick)` functions which were added to a list and, as you might guess, tick'd every, well, tick.

Now, there's no real “services” as a distinct feature: just a list of events which are passed to the the MUD when it's started. At the moment, the Teraum MUD is started by the following statement:

```
    (run-engine
       (make-engine
        "Teraum"
        (list (accounts)
    	  (actions)
    	  (mudmap teraum-map)
    	  (mudsocket)
    	  (talker))))
```

The `(make-engine)` function takes a name, and then a sequence of functions. The one we'll be looking at this time is the second in that list – `(actions)`.

The reason we add `(actions)` to the list instead of just `actions` is because we actually want to add the _result_ of calling the procedure to the list of initial events, not the procedure itself.

So, what is the result of calling the `actions` procedure?

```
    (define (actions)
      (define actions (make-hash))
      (define (load state)
        (let ([schedule...])))
      (define (tick state)
        (let ([schedule...])))
      load)
```

I've cut out the contents of the two procedure definitions that live inside the `actions` procedure, of `load` and `tick`, for now, to keep things more readable.

We can see that when `(actions)` is called, it defines a variable inside itself, `actions`, as an empty hash-table, and then defines the two procedures I just mentioned, and then returns one of them, the load procedure.

So, calling the `actions` returns another procedure, `load`.

This `load` procedure is what's scheduled as an event. Then, when _Racket-MUD_ is started and begins ticking, it is called – and is passed the MUD's `(scheduler . state)` pair.[1](https://teraum.writeas.com/the-actions-event#fn.1) We're ready to look at what the `load` procedure here actually contains, then.

Again, I'm going to simplify it.

```
    (define (load state)
      (let ([schedule (car state)]
    	[mud (cdr state)])
        (hash-set! (mud-hooks mud)
    	     'apply-actions-quality
    	     (λ (thing)...))
        (schedule tick)
        state))
```

So, what is it that's happening when this event is called?

First, it looks at the `state` it is passed and breaks it into its constituent components: a `schedule` procedure for adding new events to be called in the next tick, and the `mud` data structure, which contains the current _state_ of the MUD: name, scheduled _events_, extant _things_, and _hooks_.

**_Hooks_** are procedure that are available across the engine, and serve as kind of a generalized key-value database of functions. Think of it like a table:

|Hook|Procedure|
|---|---|
|`apply-actions-quality`|`(λ (thing) (map (λ...`|
|`broadcast`|`(λ (chan speaker message)...`|
|`move`|`(λ (mover destination)...`|

So, this event, this `load` procedure returned by calling `(actions)`, adds the `apply-actions=quality` hook. We might end up looking at that hook's procedure in another explainer. Then, it schedules the `tick` procedure defined when we first called `(actions)`, and returns the MUD's new state, now that it contains the `apply-actions-quality`.

So in general, for any givenevent, the MUD's `(scheduler . state)` pair goes in, gets changed about, and then returned.

In this case, the MUD's state gets a hook added to it, and another event gets scheduled: tick.

After this, the other events scheduled for the engine's first tick happen, and then the engine moves on to the second tick, eventually coming to the event that `load` scheduled: `tick`.

Here's an abbreviated rendering of that procedure:

```
    (define (tick state)
      (let ([schedule (car state)]
    	[mud (cdr state)]
    	[triggered (list)])
        (hash-map actions
    	      (λ (chance records)...))
        (schedule tick)
        state))
```

As you can see, the beginning and end of this procedure are nearly the same as `load` was: it breaks up the MUD's `(scheduler . state)` pair into its constituents, and then later, after doing some sutff, schedules itself, `tick`, and then returns the new state.

(`(scheduler . state)` _pair_ takes a while to type out. You might also see it written as the lowercase theta, θ, with an uppercase delta, Δ, used to represent schedule and a lowercase psi, ψ, for state. But not always -it depends on who wrote the code and documentation.)

Anyway! This brings us to the one thing about the `actions` procedure that's relatively unique, and handles what it actually _does_: what it does each _tick_.

It does two basic things:

1. First it looks through every known action, a hash-table of actions added when the `apply-actions-quality` hook is called. a) For every record, it generates a random number between 0 and 10,000. If that number is… greater-than? less-than? Whichever makes sense, then the event is triggered: added to a list of triggered events.
2. Second, for every triggered event, handle its _task_ (the actual… action-y part of the action: not the actor, and not the chance, but the thing that happens.) b) If the task is a string, and the actor is in some sort of environment, send the string to every client in that same environment. c) If the task is a procedure, call it, passing it the actor.

That's it! That's how those room chats y'all who've played the demo come to love work. For completeness, here's the actual statements that handle triggering and calling tasks, but it relies on procedures defined deeper in the engine, which haven't yet been explained:

```
    (hash-map actions
    	  (λ (chance records)
    	    (for-each (λ (record)
    			(when (<= (random 10000) chance)
    			  (set! triggered
    				(append (list record)
    					triggered))))
    		      records)))
       (for-each
         (λ (action)
           (let* ([actor (first action)]
    	      [task (third action)]
    	      [actor-quality (quality-getter actor)]
    	      [actor-location (actor-quality 'location)]
    	      [actor-exits (actor-quality 'exits)])
    	 (cond
    	   [(string? task)
    	    ;send to things in th environment
    	    (let* ([environment (cond [actor-location actor-location]
    				      [actor-exits actor])])
    	      (when (procedure? environment)
    		(let ([environment-contents
    		       ((quality-getter environment) 'contents)])
    		  (for-each
    		   (λ (thing)
    		     (((string-quality-appender thing) 'client-out)
    		     task))
    		   (things-with-quality environment-contents 'client-out)))))
    	    ]
    	   [(procedure? task)
    	    (task actor)])))
         triggered)
```

## Footnotes

[1](https://teraum.writeas.com/the-actions-event#fnr.1) An explanation of this will come… later.
