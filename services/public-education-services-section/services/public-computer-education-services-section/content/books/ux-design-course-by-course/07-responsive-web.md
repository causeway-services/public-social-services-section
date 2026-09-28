# Responsive websites: layouts, breakpoints and structure

*Companion to Course 6, Build Dynamic User Interfaces (UI) for Websites.
Before you start: Chapters 4 to 6.*

## What you will be able to do

- Explain responsive web design and its three techniques.
- Choose breakpoints and design mobile first.
- Plan a website's information architecture with a sitemap, and choose
  navigation and page layouts.
- Take a website through the whole design process, including a usability
  study, and iterate on it.

## Responsive design

A website is seen on screens from a phone's width to a wide monitor.
**Responsive web design**, named by Ethan Marcotte in 2010, adapts one site to
all of them with three techniques [@marcotte2010]:

- **Fluid grids:** layouts sized in proportions rather than fixed pixels, so
  columns stretch and shrink.
- **Flexible images:** images that scale within their containers.
- **Media queries:** style rules that apply at particular screen widths, so
  the layout can change, not only stretch.

The widths at which the layout changes are **breakpoints**. Choose them where
the content starts to look wrong (lines too long, cards too cramped), not at
the widths of particular devices, which keep changing. Many teams start from
three: phone, tablet and desktop.

## Mobile first

Luke Wroblewski argued for **mobile first**: design the small screen first,
then add to it for larger ones [@wroblewski2011]. The small screen forces
priorities: only what matters most fits, which usually makes the large-screen
design better too. It also matches how many people now reach the web first.

## Structure: sitemaps, navigation and layouts

A website's **information architecture** (Chapter 4) starts with a
**sitemap**: every page and how pages connect, usually as a hierarchy.
Navigation follows from it:

- **Top navigation bar:** the main sections across the top; works on wide
  screens.
- **Hamburger menu:** navigation hidden behind an icon; saves space on
  phones, but hidden options are used less, so keep the most important ones
  visible.
- **Tab bar:** a few main sections at the bottom of a phone screen, within
  reach of a thumb.
- **Breadcrumbs:** the path from the home page to the current page.
- **Search:** essential when there's a lot of content.

Common page layouts:

- **Single column:** content stacked top to bottom; natural on phones.
- **Card grid:** items as cards in a grid that reflows from one column to
  two or three; good for browsing collections.
- **Split screen or sidebar:** main content with a secondary column on wide
  screens, stacking below it on narrow ones.

Whatever the layout, the order in the code, which is the order a screen
reader follows, should match the visual order.

## The process for a website

Designing a site follows the same stages as an app: empathize (who visits
and why), define (the main problem the site solves), ideate (sketch layouts
for each breakpoint), prototype (wireframes, then mockups at each
breakpoint), and test.

Test on real devices and real widths: a design that works on a desktop
prototype can fail on a phone. A **usability study** for a site gives
participants realistic tasks ("Find out whether you can borrow a ladder this
weekend") on the device they normally use, and records where they struggle.
Iterate on what you learn.

## Worked example: the tool library's website

The volunteers want a website as well as the app, for people who won't
install an app.

**Sitemap.** Home → Browse tools (by category) → Tool page → Reserve;
How it works; Membership; Visit us (hours, map); Account.

**Mobile first.** On a phone: the home page is a single column with a
search field, "Available now" as a list of cards, and a tab bar (Home, Browse,
Reservations, Account). At the tablet breakpoint the cards become a two-column
grid; at the desktop breakpoint, a three-column grid with a top navigation bar
replacing the tab bar, and a sidebar of categories on the Browse page.

**Breakpoints** are set where the card text starts wrapping awkwardly: about
600 and 1,000 pixels wide in this design.

**Usability study.** Five participants on their own phones, and three on
laptops. Finding: on phones, members didn't find "Visit us" because it was
only in the hamburger menu; it moves to the home page's footer and the tab
bar's Account screen. On laptops, the sidebar's categories were overlooked
beside large photos; the photos shrink.

## Key terms

- **Responsive web design: fluid grids, flexible images, media queries.**
- **Breakpoint; mobile first.**
- **Sitemap; top navigation; hamburger menu; tab bar; breadcrumbs; search.**
- **Single-column, card-grid and sidebar layouts.**

## Check yourself

1. Name Marcotte's three techniques of responsive web design.
2. Where should breakpoints go?
3. Why does designing mobile first often improve the desktop design?
4. What's the main risk of putting navigation behind a hamburger menu?
5. Why must the order in the code match the visual order?
6. A card grid has three columns on desktop. What should it do on a phone?
7. Why test a responsive site on real devices?

## Answers

1. Fluid grids, flexible images and media queries.
2. Where the content starts to look wrong as the width changes, not at
   particular devices' widths.
3. The small screen forces decisions about what matters most, and those
   priorities carry over to the larger layout.
4. Hidden options are used less, so important destinations can be missed.
5. Because screen readers and keyboards follow the code's order; if it
   differs from what's seen, people using them get a confusing sequence.
6. Reflow to a single column (or two on a wide phone), keeping the most
   important cards first.
7. Because prototypes viewed on a desktop can hide problems that appear only
   at real widths, with real touch input and real connections.

*Next: Chapter 8 designs across devices for social good and builds the
portfolio.*
