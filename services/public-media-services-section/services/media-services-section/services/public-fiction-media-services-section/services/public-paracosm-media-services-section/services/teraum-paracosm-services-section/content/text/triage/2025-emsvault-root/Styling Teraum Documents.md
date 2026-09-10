---
aliases: 
keywords:
  - eee
  - eeef
  - eee0
  - 31B
  - 42C
  - 42c3
  - 31b7
created: 2019-04-29T21:54:47
modified: 2025-07-13T21:56:47
---

## Introduction

***Bellybrush Theme*** is a CSS theme for styling [_Teraum_](https://emsenn.neocities.org/teraum/index.html) reference books and other materials.

This document is a *draft*: it is incomplete in one or more ways.

This document was written by me, [emsenn](https://emsenn.net/), and is released for the benefit of the public under the terms included in the ["License"](https://emsenn.neocities.org/bellybrush-theme#supplements-license) supplement. It was made possible with financial [contributions](https://emsenn.neocities.org/bellybrush-theme#supplements-contribute) from humans like you. Please direct comments to my [public inbox](https://lists.sr.ht/~emsenn/public-inbox/) or, if necessary, my [personal email](mailto:emsenn@emsenn.net).

This document is implemented using the *literate programming* paradigm. The "software" being presented is included as sections of code, within a longer piece of prose which explains the code's purpose and usage. For a more complete explanation of my implementation of the paradigm, see ["Literate Programming"](https://emsenn.neocities.org/style-manual.html#literate-programming) in my [_Style Manual_](https://emsenn.neocities.org/style-manual.html).

## Bellybrush Theme

### Design Philosophy

The *Bellybrush Theme* theme is based on my own [**Oats**](https://emsenn.neocities.org/oats.html), which is based on another of my themes, [**Brutstrap**](https://emsenn.net/projects/brutstrap/) which claims to style content as it's constructed.

However, *Brutstrap* is catered toward a rather stark aesthetic, to make it more readily match the [brutalism](https://brutalist-web.design/) advocated by [David Bryant Copeland](https://naildrivin5.com/).

Bellybrush is more light-hearted. It's designed to be used for a set of reference books I'm written for a funny fantasy setting, and so hopefully reflects that.

### CSS Rules

This CSS is all availble at [`./build/bellybrush-theme/bellybrush.css`](https://emsenn.neocities.org/build/bellybrush-theme/bellybrush.css) or under the ["Complete CSS"](https://emsenn.neocities.org/bellybrush-theme#complete-css) subsection of ["Supplements"](https://emsenn.neocities.org/bellybrush-theme#supplements).

#### Base Rules

The theme's ***base rules*** are those that go with HTML tags directly.

##### HTML Tag Rules

Document-wide settings, including those relevant to font-styling, are declared in the `html` rule.

html {
	color: #444;
	background-color: #eee;
	hyphens: auto;
	font-family: sans-serif;
	letter-spacing: .03em;
	word-spacing: .05em;
	line-height: 1.4;
	font-size: 1.3rem;
}

These colors are the lowest-contrast, three-digit hex codes that still pass [WCAG2 AAA](https://www.w3.org/TR/WCAG20/). Adding some spacing between letters and words helps make the document feel a little more "friendly," and makes it a little safer to use more distinctive fonts in your body text.

##### Body Tag Rules

body {
	width:85vw;
	max-width:40rem;
	margin:0 2rem;
	padding:3rem 2rem 6rem;}
  }

##### Header Tag Rules

header {
	overflow: hidden;
	padding: 1rem 0 3rem 0;
	background: linear-gradient(to bottom, #eeef 92%, #eee0);
}

##### Main Tag Rules

main{
	width: 80vw;
	max-width: 40rem;
	margin: -4rem 1em -6rem;
	padding: 3rem 2rem 6rem;
	background: linear-gradient(to right, #eee0, #eeef 02%, #eeef 98%, #eee0);
}

##### Footer Tag Rules

footer {
	padding: 4rem 1rem 1rem;
	background: linear-gradient(to top, #eeef 97%, #eee0);
}

##### Headline Tag Rules

###### H1 Tag Rules

h1 {
	font-weight: normal;
	font-size: 2.8em;
	margin: 0 auto;
	text-align: left;
	padding: 0 .5em;
}

###### H2 through H6 Tag Rules

h2 {
  font-size: 2.3em;
}
h3 {
  font-size: 2.1em;
}
h4 {
  font-size: 1.9em;
}
h5 {
  font-size: 1.7em;
}
h6 {
  font-size: 1.5em;
}

##### Link Tag Rules

a {
  color: #31B;
  text-decoration: underline dotted #4447;
  text-shadow: 0 0 .1em rgba(68,68,68,.2);
}
a:visited {
  color: #718;
}
a:hover {
  color: #42C;
  outline-style: none;
  text-decoration: underline solid #42c3;
  text-shadow: 0 0 .1em #31b7;
}
a:focus {
  color: #42C;
  outline-style: none;
  text-decoration: underline solid #42c3;
  text-shadow: 0 0 .1em #31b7;
}
a:visited:hover, a:visited:focus {
	color: #918;
	text-decoration: underline solid #9183;
	text-shadow: 0 0 .1em #7187;
}

##### Image Tag Rules

img {
	max-width: 100%;
	max-height: 20em;
}

#### Partials Rules

##### Skip-to-Content Rules

.skipToContentLink {
  opacity: 0;
  position: absolute;
}
.skipToContentLink:focus{
	opacity:1
}

##### Table Rules

#### State Rules

##### Selection Rules

::selection {
	color: #222;
	background-color: #777;
}

## Supplements

### Contribute

This document was made possible with contributions from humans like you. Thank you! I currently accept contributions through the following platforms:

- One-time through…
	- [Paypal](https://www.paypal.me/emsenn)
	- [Ko-fi](https://ko-fi.com/emsenn)
- Recurring through…
	- [Liberapay](https://liberapay.com/emsenn/donate)

If there is another service through which you'd like to contribute, please [send an email.](mailto:emsenn@emsenn.net) ***Please note*** that in accordance with my [personal directives #003](https://emsenn.neocities.org/personal-directives.html#003) and [#018](https://emsenn.neocities.org/personal-directives.html#018), I release all useful information I create for free, so financial contributions do not entitle you to access to any "exclusive content."

### License

Copyright 2019 emsenn

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### Complete CSS

html {
	color: #444;
	background-color: #eee;
	hyphens: auto;
	font-family: sans-serif;
	letter-spacing: .03em;
	word-spacing: .05em;
	line-height: 1.4;
	font-size: 1.3rem;
}
body {
	width:85vw;
	max-width:40rem;
	margin:0 2rem;
	padding:3rem 2rem 6rem;}
  }
header {
	overflow: hidden;
	padding: 1rem 0 3rem 0;
	background: linear-gradient(to bottom, #eeef 92%, #eee0);
}
main{
	width: 80vw;
	max-width: 40rem;
	margin: -4rem 1em -6rem;
	padding: 3rem 2rem 6rem;
	background: linear-gradient(to right, #eee0, #eeef 02%, #eeef 98%, #eee0);
}
footer {
	padding: 4rem 1rem 1rem;
	background: linear-gradient(to top, #eeef 97%, #eee0);
}
h1 {
	font-weight: normal;
	font-size: 2.8em;
	margin: 0 auto;
	text-align: left;
	padding: 0 .5em;
}
h2 {
  font-size: 2.3em;
}
h3 {
  font-size: 2.1em;
}
h4 {
  font-size: 1.9em;
}
h5 {
  font-size: 1.7em;
}
h6 {
  font-size: 1.5em;
}
a {
  color: #31B;
  text-decoration: underline dotted #4447;
  text-shadow: 0 0 .1em rgba(68,68,68,.2);
}
a:visited {
  color: #718;
}
a:hover {
  color: #42C;
  outline-style: none;
  text-decoration: underline solid #42c3;
  text-shadow: 0 0 .1em #31b7;
}
a:focus {
  color: #42C;
  outline-style: none;
  text-decoration: underline solid #42c3;
  text-shadow: 0 0 .1em #31b7;
}
a:visited:hover, a:visited:focus {
	color: #918;
	text-decoration: underline solid #9183;
	text-shadow: 0 0 .1em #7187;
}
img {
	max-width: 100%;
	max-height: 20em;
}
.skipToContentLink {
  opacity: 0;
  position: absolute;
}
.skipToContentLink:focus{
	opacity:1
}

::selection {
	color: #222;
	background-color: #777;
}

### Demonstration HTML

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
	<link href="https://gmpg.org/xfn/11" rel="profile">
	<meta charset="UTF-8">
	<meta name="description" content="Bellybrush Theme is a simple and neutral CSS theme.">
	<meta name="keywords" content="oats, css, theme">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" type="text/css" href="./bellybrush.css">
	<title>Bellybrush Theme</title>
  </head>
  <body>
	<a class="skipToContentLink" href="#content">Skip to Content</a>
	<header>
	  <h1>Bellybrush Theme</h1>
	</header>
	<main id="content">
	  <p>
		Bellybrush Theme is a simple and neutral CSS theme.
	  </p>
	  <section id="features">
		<h2>Features</h2>
		<ul>
		  <li>
			<strong>Very little,</strong> honestly.
		  </li>
		</ul>
	  </section>
	</main>
  </body>
</html>