#lang racket

(require "./recipes.rkt")

(provide oru-oru-settlement)


(define oru-oru-settlement
  (teraum/area/human-settlement
   #:name "Oru Oru settlement"
   #:description "This is the settlement of the Oru Oru community. There are eight domed structures covered in birch bark."
   #:exits '()))
