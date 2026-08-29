#lang scribble/manual

@(require scribble/eval
	  (for-label racket)
	  (only-in (for-label "../things.rkt")))

@(define teraum-eval (make-base-eval))

@title{Teraum: a tragically funny fantasy world}

@author{emsenn}

@defmodule[teraum]

@emph{@bold{NOTE:}} This documentation is for people who want to learn to create content (or more) for Teraum. If you're a player, check out @hyperlink[https://emsenn.itch.io/teraum]{the itch.io community}.


 @interaction-eval[#:eval teraum-eval
                   (require "./things.rkt")]
 @examples[
	#:eval teraum-eval
 ]


@table-of-contents[]
