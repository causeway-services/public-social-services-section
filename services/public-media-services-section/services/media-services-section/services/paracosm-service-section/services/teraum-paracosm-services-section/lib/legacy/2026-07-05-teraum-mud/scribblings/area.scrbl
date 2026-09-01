#lang scribble/manual

@(require scribble/eval
	  (for-label racket)
	  (only-in (for-label "../area.rkt")))

@(define area-eval (make-base-eval))

@interaction-eval[#:eval area-eval
                  (require "area.rkt")]

@title[#:tag "area"]{Area}

@defmodule[teraum/engine/area]

Areas of the representation of places in which characters and objects can exist: the marches of a county, a town, or a closet.

@defstruct[area ([contents list?]
		 [exits hash?])]{
A structure type for areas, the places of the MUD world.
}

@examples[
	#:eval area-eval

]
