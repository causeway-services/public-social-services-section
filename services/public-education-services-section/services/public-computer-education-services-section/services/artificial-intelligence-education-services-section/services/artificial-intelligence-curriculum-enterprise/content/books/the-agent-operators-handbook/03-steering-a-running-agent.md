---
title: "Chapter 3: Steering a Running Agent"
---

# Chapter 3: Steering a Running Agent

## A message queues; it does not interrupt

Once an agent is running, you can send it a message to change what it
does next — a correction, new information, a redirection. It's worth
understanding precisely what that message does mechanically, because the
wrong mental model here causes real mistakes.

In most current tools, a steering message queues for the agent's *next tool call*. It does not
interrupt whatever the agent is doing mid-action. If the agent is in the
middle of running a long build, your message waits until that build
finishes and the agent goes to decide its next step; it does not stop the
build. If the agent is halfway through writing a file, your message
doesn't yank the pen out of its hand.

This matters most when the thing you need to tell the agent is urgent —
the environment underneath it just changed in a way that invalidates
what it's doing. If a file it's about to edit just got moved by another
process, if a shared resource it's about to write to just got claimed by
someone else, if an assumption it's operating on just became false — send
that message immediately, and understand that it will still take effect
only at the agent's next natural decision point, not instantly. Don't
mistake "I sent the correction" for "the agent has already incorporated
it." Watch for the agent's next action to confirm it landed.

## Never say "done" before it's true on disk

This rule runs in both directions, and it deserves to be stated as
starkly as possible: never tell an agent — and never tell a person, in a
status update, a message to a teammate, or your own notes — that
something is done before it is actually done on disk. Not "should be
done by now." Not "probably finished." Done means you checked, and the
file, the test result, the deployed state actually reflects the claim.

The reason this rule earns its own paragraph rather than being folded
into general professionalism: a premature "done" doesn't just create
minor embarrassment when it turns out to be false. It propagates. If you
tell a second agent "the migration script is already updated, build on
top of it," and it isn't actually updated yet, the second agent will now
build its own work on a false premise, and by the time anyone notices,
you have two pieces of work that need to be untangled instead of one
clean sequence. Whatever reads your claim next — a person, another
agent, your own future self — inherits the error at one remove, where
it's much harder to see.

## The one-nudge rule for a stuck agent

Sometimes an agent appears to be stuck — idling, repeating a phrase like
"waiting for the build to finish," not making visible progress. The
instinct is to nudge it: send another message, ask if it's still there,
try rephrasing the request. Resist repeating this. An agent that's
genuinely stuck won't be un-stuck by a second or third nudge that carries
no new information; you're just spending more tokens hoping the same
input produces a different output.

Instead, apply the one-nudge rule:

1. **Check whether the underlying process is actually still alive.** If
   the agent is waiting on a build, a test run, or a long command, look
   at whether that process is still running, hung, or already finished
   with output the agent hasn't noticed yet.
2. **Kill it if it's hung.** A process that's genuinely wedged isn't
   going to un-wedge itself; killing it and letting the agent retry is
   faster than waiting indefinitely on the chance it recovers.
3. **Try the step once, in the foreground, yourself if needed.** This
   tells you definitively whether the step itself is broken (in which
   case the agent was right to be stuck) or whether it was an artifact of
   how the agent was waiting (in which case a clean retry unblocks it).
4. **Report the real outcome and stop.** Whichever of the above turns
   out to be true, act on that finding — redirect the agent, fix the
   underlying problem, or accept that this step needs a different
   approach — rather than sending a fifth identical nudge.

This procedure costs you a small amount of investigation up front, and it
saves you from the much larger cost of an agent (or a whole afternoon)
stuck in a loop that no amount of "are you there?" was ever going to
break.

## Stopping an agent, and its children

If you need to stop a running agent, stop it explicitly, using whatever
your tooling provides for terminating a task — don't just close the
conversation and assume the underlying process dies with it. And be
aware of a subtlety that catches people off guard: if the agent you
stopped had itself spawned child agents (a common pattern when one agent
delegates sub-pieces of its own task), those children may keep running as
independent tasks even after their parent is gone. Stopping the parent
does not automatically stop its children. If you don't want them
continuing — and usually you don't, especially if the reason you stopped
the parent was that its whole plan turned out to be wrong — check for
and stop the children individually.

This is not a hypothetical edge case. It's exactly the kind of thing that
produces the "wait, why is there still an agent editing this file, I
thought I stopped everything" moment, usually discovered only because
something changed on disk that nobody expected.

## A worked example

You're running two agents concurrently on a subscription billing
codebase: one implementing a new discount-code feature, one investigating
a reported bug in the invoice PDF renderer. Twenty minutes in, you
realize the discount-code feature needs to change the shape of the
`Invoice` record — a field the PDF-renderer investigation agent is
currently reading to understand the bug.

The correct move: send the discount-code agent a steering message
immediately, telling it the field shape change means it now also needs
to coordinate with (or wait for) the renderer investigation, since that
agent's read-only findings might reference the field it's about to
change shape. You cannot assume this message takes effect mid-edit if the
agent happens to already be writing the schema change when your message
arrives — it will pick it up at its next tool call, which for an agent
mid-edit might already be the completion of that specific write. Watch
its next action. If it's already past the point where the warning would
have mattered, you may need to stop it, assess what it actually wrote,
and decide from measured state rather than from what you intended the
message to prevent.

The wrong move, and a common one: assume the message landed instantly,
tell the renderer-bug agent "the field shape is already updated, use the
new shape," and move on — before confirming the discount-code agent
actually finished that change. If it hadn't, the renderer agent is now
working from a false "done" claim, and you've created exactly the
propagating error described earlier in this chapter.

## What comes next

Steering handles an agent that's still running. The next chapter handles
the harder case: an agent whose report never arrived at all, because you
lost the thread, the session restarted, or something else interrupted
the connection between you and it. The instinct there is almost always
wrong, and getting it right is worth a chapter of its own.
