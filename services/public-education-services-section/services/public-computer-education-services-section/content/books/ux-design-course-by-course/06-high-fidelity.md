# High fidelity: visual design, design systems and handoff

*Companion to Course 5, Create High-Fidelity Designs and Prototypes in Figma.
Before you start: Chapter 5's revised low-fidelity design.*

## What you will be able to do

- Apply the elements of visual design (type, color, layout, imagery) and its
  principles (hierarchy, contrast, alignment, consistency) to a mockup.
- Check a design's color and text against accessibility requirements.
- Explain what a design system is and how components and tokens keep a
  product consistent.
- Build a high-fidelity prototype and run a design critique.
- Prepare a design for handoff to engineers, including accessibility notes.

## From wireframe to mockup

A **mockup** is a static, high-fidelity image of a screen: the real layout,
type, color, images and text. It answers how the product will look. A
**high-fidelity prototype** links mockups with interactions so they behave
like the finished product. Move to high fidelity once research has settled
the structure; polishing an untested structure wastes effort and makes people
reluctant to change it.

## Elements of visual design

**Typography.** Choose one or two typefaces, and build a **type scale**, a
small set of sizes for headings, body and captions, so every screen draws
from the same few. Body text needs a comfortable size and line length:
Robert Bringhurst's guide puts a good line at 45 to 75 characters
[@bringhurst2012]. Use weight and size, not many typefaces, to show
hierarchy.

**Color.** A palette typically has a primary color (brand and main actions),
secondary colors, neutrals for text and backgrounds, and semantic colors for
success, warning and error. Use color to signal and to group, never as the
only signal (Chapter 1).

**Layout and grids.** A **grid** of columns, gutters and margins aligns
elements and makes screens consistent. Common choices are 12 columns on
desktop and 4 on phones. **White space** (empty space) separates groups and
gives important things room.

**Imagery and icons.** Images should inform, not decorate. Icons need text
labels unless their meaning is universal; a magnifying glass for search is
close, most others aren't.

## Principles of visual design

- **Hierarchy:** size, weight, color and position show what matters most.
  People should see how to move through a screen before they read it.
- **Contrast:** difference draws the eye to what's important, and makes text
  readable.
- **Alignment:** elements that line up read as organized and related.
- **Proximity and grouping:** related items sit together (the Gestalt
  principles of Chapter 4).
- **Consistency:** the same thing looks and behaves the same everywhere, so
  people learn it once. This is also one of Nielsen's heuristics
  [@nielsen1994].

## Accessible visual design

The Web Content Accessibility Guidelines set measurable minimums [@wcag22]:

- **Text contrast** of at least 4.5 to 1 against its background (3 to 1 for
  large text).
- **Contrast of controls and graphics** needed to use the interface, such as
  button borders and focus rings, of at least 3 to 1.
- **No color alone:** pair color with text, icons or patterns.
- **Resizable text:** layouts must work when text is enlarged.
- **Target size:** WCAG 2.2 adds a minimum target size for pointer inputs, so
  small controls don't defeat people with tremors or large fingers.

Check contrast with a contrast checker as you choose colors, not after.

## Design systems

A **design system** is a shared set of reusable components, standards and
guidance that keeps a product consistent as teams and screens grow. It
usually includes:

- **Design tokens:** named values for color, type, spacing and so on
  (`color-primary`, `space-2`), used everywhere instead of raw values.
- **Components:** reusable interface pieces (buttons, fields, cards, menus)
  with defined **variants** and states (default, hover, pressed, disabled,
  error).
- **Patterns and guidelines:** how to combine components and when to use
  each, including accessibility rules.

Brad Frost's **atomic design** describes building interfaces from the small
up: atoms (a label, a button), molecules (a search field with its button),
organisms (a header), templates (page layouts) and pages (real content in a
template) [@frost2016]. Design tools support this with reusable components:
change the main component and every copy updates.

## High-fidelity prototypes and critique

A high-fidelity prototype adds **interactions** (tap, hover, drag),
**transitions** between screens and, where it helps, **motion**. Motion should
explain (a sheet sliding up from the button that opened it), not decorate, and
people who turn on "reduce motion" should get less of it.

A **design critique** is a structured review of work in progress. Present the
goal and the problem first, so feedback is judged against them. Good feedback
is specific ("the Reserve button is lower in hierarchy than the tool photo"),
tied to the goal, and about the design, not the designer. The designer
listens, asks questions and decides what to act on.

## Handoff

**Handoff** is giving engineers what they need to build the design exactly:

- **Specifications:** sizes, spacing, type and colors, ideally as tokens;
  design tools can show these for any element.
- **Assets:** exported icons and images in the right formats and sizes.
- **Behavior:** states, transitions, error cases, empty states, what happens
  on slow connections.
- **Accessibility annotations:** heading levels, reading and focus order,
  labels for every control, alt text for images, what a screen reader should
  announce.
- **The flow:** a prototype or diagram of how screens connect.

Handoff isn't the end of design: stay available as engineers build, and
review what they build.

## Worked example: the tool page in high fidelity

**Type and color.** One sans-serif typeface; a type scale of 32, 24, 18 and
16 points; body at 16 with lines under 70 characters. Primary green
`#1B6B3A` on white measures 6.5 to 1, passing for text; "Available" shows as a
green label *with the word*, and "Out until Tue" as a gray label with its
text.

**Grid.** Four columns on phones with 16-point margins; the Reserve button
spans all four.

**Design system.** Tokens for colors and spacing; components for the tool
card (image, name, availability label, button), the availability label (three
variants: available, reserved, out), and the time picker. When the team
changes the label's corner radius, every screen updates.

**Critique.** Feedback: "On the home screen, the tool photos draw the eye
before the availability labels, but the research said availability is what
members check first." Change: smaller photos, larger labels.

**Handoff notes for the tool page.** Heading level 1 is the tool name; focus
order is name → availability → Reserve → details; the Reserve button's
accessible name is "Hold this tool"; the tool photo's alt text names the tool
and its condition.

## Key terms

- **Mockup; high-fidelity prototype.**
- **Typography; type scale; line length; color palette; grid; white space.**
- **Hierarchy; contrast; alignment; consistency.**
- **Contrast ratio; target size.**
- **Design system; design tokens; components; variants; states; atomic
  design.**
- **Interaction; transition; motion; design critique.**
- **Handoff; specifications; assets; accessibility annotations.**

## Check yourself

1. What's the difference between a mockup and a high-fidelity prototype?
2. What minimum contrast does WCAG require for normal body text? For a
   button's border?
3. Why should design tokens replace raw color values in a design?
4. Name the five levels of atomic design, from smallest to largest.
5. A critique comment says "I don't like the green." How could it be made
   more useful?
6. List four things a handoff should include.
7. Why move to high fidelity only after testing the structure?
8. A screen uses five typefaces and four button styles. Which principles
   does it break, and what's the fix?

## Answers

1. A mockup is a static, high-fidelity image; a high-fidelity prototype links
   mockups with interactions so they behave like the product.
2. 4.5 to 1 for normal text; 3 to 1 for user-interface components such as
   button borders.
3. So a change in one place updates everywhere, and every screen stays
   consistent.
4. Atoms, molecules, organisms, templates, pages.
5. Tie it to the goal and be specific: for example, "The green is close to
   the red error color, so colorblind members may not tell available from
   out. Could the label add an icon?"
6. Any four of: specifications (ideally tokens), assets, behavior and states,
   accessibility annotations, the flow.
7. Because polishing an untested structure wastes work, and polished designs
   make people reluctant to change what testing shows is wrong.
8. Consistency (and hierarchy, since everything competes). Use one or two
   typefaces with a type scale, and one button component with defined
   variants.

*Next: Chapter 7 designs a responsive website.*
