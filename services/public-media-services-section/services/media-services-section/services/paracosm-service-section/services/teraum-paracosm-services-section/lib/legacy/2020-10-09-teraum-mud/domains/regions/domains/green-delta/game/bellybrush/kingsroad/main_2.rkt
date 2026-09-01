#lang racket

(require qtops/qualities/area
         qtops/qualities/region
         "../../../../../qualities/brusher.rkt")

(provide <>kingsroad)

(define (<>market t)
  (<>area
   t #:name "market"
   #:description "This is Bellybrush's largest market, mostly featuring farmers and ranchers from the surrounding counties selling their produce to resellers who will sell it to grocers and restaurants in Bellybrush and Ack."))
(define (<>realtor t)
  (<>area
   t #:name "realtor"
   #:description "This is a realtor's office. It's rather odd that it's unlocked and unoccupied, but that's what you get with indie games. Lucky for the realtor, no game features enable you to steal anything."))
(define (<>old-bastion t)
  (<>area
   t #:name "Old Bastion"
   #:description "This is an old and crumbling fort."))
(define (<>mother-joffas t)
  (<>area
   t #:name "Mother Joffa's Orphanage and Laundromat"
   #:description "This is the courtyard of a three-storey brick building which surrounds on three sides, opening up onto the Kingsroad as it runs through the town of Bellybrush. The sounds of children taunting each other fills the air, broken every so often by an escalation of laughter."))
(define (<>kingsroad-1 t)
  (<>area
   t #:name "Kingroad"
   #:description "This is the west end of the Kingsroad as it runs through the town of Bellybrush. To the north of here is Siddon Street, while the Kingsroad runs east and west. Southeast of here is a realtor."))
(define (<>kingsroad-2 t)
  (<>area
   t #:name "Kingroad"
   #:description "This is the Kingsroad in Bellybrush, toward the west end of town. North of here is the town's largest market. The Kingsroad continues east and west from here."))
(define (<>kingsroad-3 t)
  (<>area
   t #:name "Kingroad"
   #:description "This is the Kingsroad in Bellybrush, south of Arathel Street. The Kingsroad itself continues to the west and southeast."))
(define (<>kingsroad-4 t)
  (<>area
   t #:name "Kingroad"
   #:description "This is Kingsroad, where it intersects with Slade Street to the east. The Old Bastion is southwest of here. The Kingsroad runs northeast and southwest from here."))
(define (<>kingsroad-5 t)
  (<>area
   t #:name "Kingroad"
   #:description "This is the Kingsroad about halfway through the town of Bellybrush. A large brick building has an open courtyard against the street to the northeast. The Kingsroad runs northwest and east."))
(define (<>kingsroad-6 t)
  (<>area
   t #:name "Kingroad"
   #:description "This is the Kingsroad just south of its intersection with Quibble Street. The Kingsroad runs east and west from here."))
(define (<>kingsroad-7 t)
  (<>area
   t #:name "Kingroad"
   #:description "This is where Boundary Street, running to the north, meets the Kingsroad, running east and west."))
(define (<>kingsroad-8 t)
  (<>area
   t #:name "Kingroad"
   #:description "This is the Kingsroad, south of Hargrove Street. The Kingsroad runs west, across the Green River, through the town of Bellybrush, and east, out toward Pled County."))

(define (<>kingsroad t)
  (<>Brusher
   (<>region
    t #:name "Kingsroad"
    #:areas `((market ,<>market)
              (realtor ,<>realtor)
              (old-bastion ,<>old-bastion)
              (mother-joffas ,<>mother-joffas)
              (kingsroad-1 ,<>kingsroad-1)
              (kingsroad-2 ,<>kingsroad-2)
              (kingsroad-3 ,<>kingsroad-3)
              (kingsroad-4 ,<>kingsroad-4)
              (kingsroad-5 ,<>kingsroad-5)
              (kingsroad-6 ,<>kingsroad-6)
              (kingsroad-7 ,<>kingsroad-7)
              (kingsroad-8 ,<>kingsroad-8))
    #:links '((kingsroad-1 southeast northwest realtor)
              (kingsroad-2 north south market)
              (kingsroad-4 southwest northeast old-bastion)
              (kingsroad-5 northeast southwest mother-joffas)
              (kingsroad-1 east west kingsroad-2)
              (kingsroad-2 east west kingsroad-3)
              (kingsroad-3 southeast northwest kingsroad-4)
              (kingsroad-4 southeast northwest kingsroad-5)
              (kingsroad-5 east west kingsroad-6)
              (kingsroad-6 east west kingsroad-7)
              (kingsroad-7 east west kingsroad-8)))))
