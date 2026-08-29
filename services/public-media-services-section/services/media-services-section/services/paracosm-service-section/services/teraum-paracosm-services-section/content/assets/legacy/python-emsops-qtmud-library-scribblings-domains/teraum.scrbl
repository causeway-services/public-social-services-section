#lang scribble/manual

@(require scribble/eval
	  (for-label racket))

@title[#:style '(toc)]{Teraum}

@author{emsenn}

Teraum is a @emph{@quote{tragically funny fantasy world}} I've been developing since I was a young child. I'm implementing it as a MUD, these days.

@local-table-of-contents[]

@include-section["player-guide.scrbl"]
@include-section["areas/areas.scrbl"]
