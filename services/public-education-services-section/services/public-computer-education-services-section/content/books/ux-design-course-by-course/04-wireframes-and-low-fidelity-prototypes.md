# Wireframes and low-fidelity prototypes

*Companion to Course 3, Build Wireframes and Low-Fidelity Prototypes. Before
you start: Chapter 3's chosen ideas.*

## What you will be able to do

- Draw big-picture and close-up storyboards.
- Organize content with basic information architecture and a sitemap.
- Create paper wireframes and move them to digital wireframes.
- Use Gestalt principles and visual hierarchy to lay out a screen.
- Build a low-fidelity prototype, on paper and in a design tool.
- Recognize implicit bias and deceptive patterns in a design, and avoid them.

## Storyboards

A **storyboard** is a sequence of panels showing a user's experience with a
solution. A **big-picture storyboard** shows the whole situation, where the
user is, what they want and how they feel, and helps a team agree on why the
product matters. A **close-up storyboard** shows the product itself, screen
by screen, and helps plan the flow. Each panel has a sketch and a caption; the
last panel shows the benefit.

## Information architecture

**Information architecture (IA)** is how content is organized, labeled and
connected so people can find things and understand where they are. Louis
Rosenfeld and Peter Morville describe its systems as organization, labeling,
navigation and search [@rosenfeld2015]. Common structures:

- **Hierarchical:** a tree from general to specific (Tools → Power tools →
  Saws).
- **Sequential:** steps in order (reserve: choose, pick a time, confirm).
- **Matrix:** more than one way into the same content (browse by project, by tool
  type, or by what's available now).

A **sitemap** diagrams a product's screens or pages and how they connect.
Label pages with the words users use; a card sort, in which users group and
name content themselves, is one way to find those words. Classification is
never neutral: the categories you choose decide what's easy to find and for
whom.

## Wireframes

A **wireframe** is a basic outline of a screen's layout: where content,
navigation and controls go, without color, imagery or final text. Wireframes
let a team settle structure before spending time on appearance.

Start on **paper**: it's fast, cheap and easy to throw away, so you'll try
more layouts. Sketch three to five versions of each key screen, mark the strongest
elements, and combine them into a refined sketch. Then move to **digital
wireframes** in a design tool such as Figma, using simple shapes: boxes for
images, lines for text, rectangles for buttons. Digital wireframes are easier
to share, align and turn into prototypes.

## Laying out a screen

People group what they see before they read it. The Gestalt psychologists
described how, beginning with Max Wertheimer in 1923 [@wertheimer1923]:

- **Proximity:** items near each other are seen as a group.
- **Similarity:** items that look alike (shape, color, size) are seen as
  related.
- **Common region:** items inside the same boundary are seen as a group,
  which Stephen Palmer demonstrated in 1992 [@palmer1992].
- **Continuity:** the eye follows lines and curves.
- **Closure:** the mind completes incomplete shapes.
- **Figure-ground:** people separate an object from its background.

**Visual hierarchy** is the order in which people notice things, set by size,
weight, contrast, position and space. A screen should tell people what
matters and how to move through it before they read the details: orientation
before interpretation. On a tool page: the tool's name and whether it's
available first, the Reserve button second, details third. Steve Krug put the goal of a web page as a title: *Don't
Make Me Think*. A page should be self-evident, so people can tell what it is
and how to use it without working it out [@krug2014].

## Low-fidelity prototypes

A **prototype** is an early model of a product that people can interact
with. **Fidelity** is how closely it resembles the finished product. A
**low-fidelity** prototype is simple and incomplete: paper screens a
facilitator swaps as the user "taps," or wireframes linked in a design tool
so that tapping a button moves to the next screen. A **high-fidelity**
prototype (Chapter 6) looks and behaves like the real thing.

Low fidelity has advantages early on: it's quick to build and change, it
invites honest feedback (people criticize a sketch more freely than a
polished design), and it keeps attention on flow and structure. In a design
tool, a low-fidelity prototype connects frames with **interactions**: a
**hotspot** or button, a trigger such as a tap, and a destination frame.

## Bias and deceptive patterns

**Implicit bias** is an unconscious association that affects decisions.
In design it appears as defaults and assumptions that exclude people: a form
that requires a first and last name in a fixed order, a gender field with two
options, a sign-up that assumes a credit card, imagery that shows only one
kind of person. Check designs against your research's range of users, and
ask whom each assumption leaves out.

**Deceptive patterns** are interface designs that trick people into doing
things they didn't intend. Harry Brignull named them "dark patterns" in 2010
and catalogued them [@brignull2010]; later research sorted them into
strategies such as nagging, obstruction, sneaking, interface interference and
forced action [@gray2018]. Examples:

- **Confirmshaming:** "No thanks, I don't care about my neighbors."
- **Roach motel:** easy to sign up, hard to cancel.
- **Sneak into basket:** an item added to a cart without asking.
- **Hidden costs:** fees revealed only at the last step.
- **Disguised ads:** ads that look like content or navigation.

They can raise a short-term number and cost trust, and some are illegal in
some places. An ethical designer refuses them.

## Worked example: from sketches to a clickable prototype

**Storyboards.** Big picture: Dana, Friday night, planning a tiling job,
checks the app, reserves the saw, picks it up Saturday, finishes by Sunday.
Close-up: home screen → search "tile saw" → tool page shows "Available" →
"Hold for Saturday 9–11" → confirmation.

**Sitemap.** Home (available now, my reservations) → Browse (by type, by
project) → Tool page → Reserve → Confirmation; Account (membership, loans,
reminders).

**Paper wireframes.** Five versions of the tool page. The strongest elements:
availability as a large colored label plus the word "Available" (not color
alone), the Reserve button directly below it, details below that.

**Gestalt check.** The date and time pickers sit in one card (common region);
all actions share one button style (similarity); the tool's details are grouped
under a heading, spaced away from the reservation controls (proximity).

**Low-fidelity prototype.** Seven digital wireframes linked in the design
tool so that "Reserve" leads to the time picker and then confirmation.

**Bias and deception check.** The membership form asked for "first name" and
"last name"; it now asks for "full name" and "what should we call you?" The
sign-up had a pre-ticked "add a donation" box; it's removed.

## Key terms

- **Storyboard: big picture, close-up.**
- **Information architecture; hierarchical, sequential and matrix structures;
  sitemap; card sort.**
- **Wireframe: paper, digital.**
- **Gestalt principles: proximity, similarity, common region, continuity,
  closure, figure-ground; visual hierarchy.**
- **Prototype; fidelity; low-fidelity prototype; interaction; hotspot.**
- **Implicit bias; deceptive patterns: confirmshaming, roach motel, sneak
  into basket, hidden costs, disguised ads.**

## Check yourself

1. What's the difference between a big-picture and a close-up storyboard?
2. Which IA structure fits a checkout process, and which fits browsing by
   multiple attributes?
3. Why start wireframes on paper?
4. A form's fields are evenly spaced, so labels seem to belong to the fields
   above them. Which Gestalt principle is being violated, and how would you
   fix it?
5. Name two advantages of low-fidelity prototypes over high-fidelity ones
   early in a project.
6. "Cancel membership" is five screens deep, while "Join" is on the home page.
   What deceptive pattern is this?
7. Give one example of implicit bias in a form.

## Answers

1. Big picture shows the user's situation and why the product matters;
   close-up shows the product's screens and flow.
2. Sequential for checkout; matrix for browsing by multiple attributes.
3. Paper is fast and cheap, so you explore more layouts and don't get
   attached to any one.
4. Proximity. Place each label closer to its own field than to the one
   above.
5. Any two: faster and cheaper to make and change; invite more honest
   feedback; keep attention on structure and flow rather than appearance.
6. Roach motel: easy to get into, hard to get out of.
7. For example: requiring a first and last name in a fixed order, offering
   only two genders, or assuming everyone has a credit card or a smartphone.

*Next: Chapter 5 tests the prototype with users.*
