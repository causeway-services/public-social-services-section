#lang racket

(require (prefix-in oru-valley/ "./oru-valley/main.rkt"))

(provide teraum-map
         (all-from-out "./oru-valley/main.rkt"))

(define teraum-map
  (make-hash
   (list
    (cons 'oru-valley/oru-oru-settlement oru-valley/oru-oru-settlement))))
