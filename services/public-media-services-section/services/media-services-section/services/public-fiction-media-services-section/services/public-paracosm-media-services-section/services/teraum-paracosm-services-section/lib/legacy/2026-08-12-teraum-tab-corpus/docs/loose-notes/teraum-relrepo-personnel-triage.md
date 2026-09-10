---
title: "Teraum"
specialization: research
---

+++
title = "Teraum"
author = ["emsenn"]
draft = false
+++

<div class="ox-hugo-toc toc">
<div></div>

<div class="heading">Table of Contents</div>

- [Introduction](#introduction)
- [Data](#data)
    - [People](#people)
    - [Places](#places)
    - [Things](#things)
    - [Species](#species)
- [Timeline](#timeline)
    - [Prehistory](#prehistory)
    - [The Great Wars](#the-great-wars)
- [Functions](#functions)
    - [Read Records](#read-records)
    - [Make Records](#make-records)
    - [Build Results](#build-results)
- [Reference Books](#reference-books)
    - [Arathel Gazetteer](#arathel-gazetteer)
- [Adventures](#adventures)
    - [The Crown of Idbol Bark](#the-crown-of-idbol-bark)
- [Essays](#essays)
    - [What Is Teraum?](#what-is-teraum)
- [Narratives](#narratives)
    - [Tales from Teraum #1: "The Man with Light"](#tales-from-teraum-1-the-man-with-light)
- [Supplements](#supplements)

</div>
<!--endtoc-->


## Introduction {#introduction}

**_Teraum_** is a tragically funny fantasy world.

This document was written by me, emsenn, in the United States. To the extent possible under law, I have waived all copyright and related or neighboring rights to this document. This document was created for the benefit of the public.


## Data {#data}

```elisp
(setq teraum-data '())
```


### People {#people}


#### Anadini, Jenos {#anadini-jenos}

```elisp
(push
 '(anadini-jenos
   (name . "Jenos Anadini")
   (description . "Jenos Anadini is a middle-aged human man who works for Honeyfern Laboratory as an archivist.")
   (inventory
    (easy-smoking-pipe .)))
 teraum-data)
```


### Places {#places}


#### Gloaming {#gloaming}

```elisp

```


#### Belcaer {#belcaer}

```elisp
(push '(belcaer
(name . "Belcaer")
(description . "Belcaer...")
(location . gloaming))
teraum-data)
```


#### Caliper Street {#caliper-street}

```elisp
(push
 '(caliper-street
   (name . "Caliper Street")
   (description . "Caliper Street runs through the Brass Ward, in Ack.")
   (nav
    (114 . twisted-alembic)))
 teraum-data)
```


#### Twisted Alembic {#twisted-alembic}

```elisp
(push
 '(twisted-alembic
   (name . "Twisted Alembic")
   (description . "The Twisted Alembic is one of the oldest pubs in the city of Ack. It has a reputation for being where the city's more eccentric engineers and chemics spend time.")
   (nav
    (south-door . caliper-street)))
 teraum-data)
```


#### Green Delta {#green-delta}

```elisp
(push
 '(green-delta
   (name . "Green Delta")
   (description . "The Green Delta is a fertile region, dense with farms and small villages.")
   (nav
    (east . central-plains)
    (southeast . gloaming)
    (south . widewoods)
    (west . optic-ocean)))
 teraum-data)
```


### Things {#things}


#### pipe, easy-smoking {#pipe-easy-smoking}

```elisp
(push
 '(pipe-easy-smoking
   (name . "easy-smoking pipe")
   (description . "The easy-smoking pipe is a wooden pipe which emits an intoxicating smoke. The magic comes from the pipe itself; anything burnt in it produces the same effect.")
   (location . anadini-jenos))
 teraum-data)
```


### Species {#species}


#### humans {#humans}

```elisp
(push
 '(humans
   (name . "humans")
   (description . "Humans are a sapient but mundane species of upright ape."))
 teraum-data)
```


## Timeline {#timeline}

```elisp
(setq teraum-timeline '())
```


### Prehistory {#prehistory}

```elisp
(push
((concat
(teraum-read-name 'gods) " from around the multiverse create the " (teraum-read-name 'worldkeep) " and then buid teraum around it.") . (50000bc))
teraum-timeline)
```


### The Great Wars {#the-great-wars}


#### 43pc {#43pc}


##### Summer, 43pc {#summer-43pc}


###### 21st of Summer, 43pc {#21st-of-summer-43pc}

```elisp
(push
 '(43pc (Summer (21
 (concat
  "In " (teraum-read-name 'pled) ", "
  (teraum-read-name 'anadini-jenos)
  " is born."))))
 teraum-timeline)
```


## Functions {#functions}


### Read Records {#read-records}


#### Read Record {#read-record}

```elisp
(defun teraum-read-record
    (subject)
  "Returns the list representing the record of SUBJECT."
  (cdr (assoc subject teraum-data)))
```


#### Read Name {#read-name}

```elisp
(defun teraum-read-name
    (subject)
  "Returns the name of the SUBJECT."
  (cdr (assoc 'name (teraum-read-record subject))))
```


#### Read Desc(ription) {#read-desc--ription}

```elisp
(defun teraum-read-desc
    (subject)
  "Returns the description of the SUBJECT."
  (cdr (assoc 'description (teraum-read-record subject))))
```


#### Read Nav(igation) {#read-nav--igation}

```elisp
(defun teraum-read-nav
    (subject)
  "Returns the nav items of the SUBJECT."
  (cdr (assoc 'nav (teraum-read-record subject))))
```


#### Read Nav(igation) Item {#read-nav--igation--item}

```elisp
(defun teraum-read-nav-item
    (subject item)
  "Returns the record of the ITEM in the SUBJECT's navigation list."
  (cdr (assoc item (teraum-read-nav subject))))
```


#### Read Location {#read-location}

```elisp
(defun teraum-read-location
    (subject)
  "Returns the location of SUBJECT."
  (cdr (assoc 'location (teraum-read-record subject))))
```


### Make Records {#make-records}


### Build Results {#build-results}


## Reference Books {#reference-books}


### Arathel Gazetteer {#arathel-gazetteer}


#### Introduction {#introduction}


#### Overview {#overview}

**_Arathel_** is the _human_-populated county seat of _Arathel County_,
in the northwest _Green Delta_. First settled in 478bc as a logging
community, Arathel is one of the larger towns in the community. It is
governed by a council of local commercial leaders. its primary exports
are _wool_, _limestone_, and _cokeberries_. Notably, Arathel was the capital
of the _Astar Empire_.


#### History {#history}


##### Founding of Arathel {#founding}

The town of Arathel was first settled by humans in 478bc, on a hill
south of the _Kaiper River_. The town first grew around the _Reinhard
Lumber Mill_, built in 477bc by _Osmits Reinhard_. Its prosperity was
aided by trade with the fisherfolk of _Ack_, who always needed fresh
lumber for their ships.

In 474bc, the community built a church in honor of _Povator_, a god of
woodlands.

In 470bc, _Osmits Reinhard_ built a small estate northwest of town,
closer to the _Kaiper River_, and began taxing the residents in
exchange for maintaining a small armory and militia.


##### Early Growth of Arathel {#early-growth}

From 470bc until 460bc the town continued to grow at a reasonable
pace. _Osmits Reinhard_ constructed a watchtower on the road southwest
out of town, toward _Ack_, while the road southeast toward _Pled_
became dotted with _wheat_ farms. The town began to export the local
_limestone_ to _Ack_, who was using it construct the many estates its
growing noble class required, and _wool_ to _Pled_. In 464bc, the
church to _Povator_ was expanded, and in 462bc, _Osmits Reinhard_
commissioned the planting of what became known as the _Borderwood_, a
strip of pine forest which separated Arathel from the countryland to
the southwest, between it and _Ack_.

As Arathel grew in size it became more of a target for bandits in the
area, which pushed _Osmits Reinhard_ to grow the size of the local
militia, drawing on the labor force of his lumber mill.


##### Arathel's First Recession {#first-recession}

The expense of the militia, and reduced workforce at his mills, caused
_Osmits Reinhard_ to fall behind in paying wages to his men, and in
the summer of 460bc, he was hanged in the town square. Control of his
mill - and subsequently the town - fell to a self-appointed council
consisting of local tradesfolk. The tradesfolk immediately
commissioned the construction of new wells and agreed that a sizeable
portion of the late _Osmits Reinhard_'s seized assets should be used
to again expand the _Povator Church_.

Unfortunately the expenses left Arathel unable to maintain a militia,
and bandits moved into the countryside, suppressing trade between the
town and _Pled_. The town council attempted to negotiate a tribute to
the bandits, but were attacked and fled the region.

Absent a government - who also were many of their skilled craftsmen -
the town fell into a deep recession. The region was fertile farmland,
so population continued to grow, but the town's trade with _Ack_ and
_Pled_ slowed to a trickle.


##### Arathel and the Founding of the Astar Empire {#founding-of-the-astar-empire}

Without trade routes to raid, many of the local bandits settled down
near the road to _Pled_, which extended southeast out of Arathel. Some
formed a little suburb past the town's _wheat_ farms and in 454bc they
built a small church to one of their gods, _Siggrit_, of _earthworms_.

In 442bc, _Povator_'s worshippers in the area constructed a
significantly nicer church on the crest of a hill north of town,
overlooking the _Kaiper River_, and several families in the area began
to construct large elegant estates. These works encouraged local
industry and again, trade with the neighboring communities of _Ack_ and
_Pled_.

As the population grew and industry began to revitalize, a reformed
gentry grew in the town. A notable member of this gentry was _Henri
Astar_, who by 440bc owned many of the farms that had been built in
Arathel and the area around it. In 438bc, _Henri_ used his wealth to
organize a militia which attacked the humans living south of the _Green
River_, in the _Indenon Empire_.

The attack quickly escalated into a continued war, which encouraged
local industry and formalized Arathel as the capital of the new _Astar
Empire._


#### Areas {#areas}


##### Old Arathel {#old-arathel}


###### First Church of Povator {#irst-church-of-povator}

First constructed in 474bc, the **_First Church of Povator_** is a
historical church in _Old Arathel_, originally serving as a place to
worship _Povator_, a god of woodlands.


###### Reinhard Estate {#reinhard-estate}


###### Reinhard Lumber Mill {#reinhard-lumber-mill}

The **_Reinhard Lumber Mill_** is a lumber mill in the town of
Arathel first opened in 474bc.


###### Second Church of Povator {#second-church-of-povator}


###### Siggrit Temple {#siggrit-temple}


## Adventures {#adventures}


### The Crown of Idbol Bark {#the-crown-of-idbol-bark}

**_Teraum_** is a _tabletop role-playing **document**_ in which the party attempts to arrest an upstart "king", usually taking two to four hours to complete.

This document was written to be played with the _Brave Old World_ ruleset, but can be adapted for any system.

This document is ready to be used, but it isn't finished. Things might be unfair to players, or unclear for narrators.

---

Danger is never far in the _Gloaming_, where marshes and mesas give home to bandits and beasts. The lone _trade road_ through the region is a gauntlet for traveling merchants.

The town of _Belcaer_ is a haven for those travelers. The same _magic_-users who built the _trade road_ built the town as a fortress. On top of a limestone mesa, the town now exists to serve travelers. Residents offer meager services, hoping to win the travelers' coin.

Recently there haven't been many coins to take. A bandit calling himself "King Brag" has been mugging travelers. Now, farmers are reporting missing livestock.

A local official named _Abeth Harbrook_ believes she has found where the "king" is hiding: _Jacob's Folly_, an tower built and abandoned in the forgotten past.

She's offering to pay anyone who captures the "king," and the party has gathered at her office.

**_{{bow-adventure-question}}}_**

{{adventure-era(Reconstruction Era)}}}
{{teraum-define(reconstruction-era)}}}

{{adventure-has-character-templates}}}

To the extent possible under U.S. law, the author of this work has
waived all copyright and related or neighboring rights to this work.

{{teraum-readmore}}}

---

Before beginning the session, your party should know:

-   How much does each of them weigh, with and without equipment?
-   Is anyone a high-ranking officer in the _Chandlers Guild_?

{{project-latex-logomark}}}
{{project-latex-licensemark}}}

{{adventure-narrator-warning}}}


#### Exposition {#exposition}


##### Settings {#settings}

-   **_Belcaer:_** A town of about four-hundred, built of stone atop a
    mesa, overlooking the only major road in the _Gloaming_.
-   **_The Gloaming:_** A region of fens and marshes, broken up by mesas
    and rock outcroppings. The region is unsettled and lawless.
-   **_Jacob's Folly:_** A three-storey limestone tower built about eight
    miles west of _Belcaer_, far from any road or notable landmark.


##### Cast {#cast}

-   **_Abeth Harbrook:_** The local _Chandlers Guild_ representative.
-   **_King Idbol Bark:_** A _goblin_ who lives with his clan in _Jacob's
    Folly_.


#### The Plot {#the-plot}


##### Scene One: Receiving the Quest {#scene-one}

The members of the party are to meet, together or individually, with
_Abeth Harbrook_, at her offices in the _Guildhouse_. She is the
highest-ranked local official of the _Chandlers Guild_, a commercial
organization based in the distant city of _Ack_.

They rely on trade coming through the _Gloaming_, so have recently
invested in the region and the town. Much of the _trade road_ has been
recently covered in gravel. In town, they built the _Guildhouse_, a
massive pine structure that sticks out over the edge of the mesa, held
up by a lattice of timber.

_Abeth Harbrook_ has kept the party waiting, and now comes out to meet
them in the waiting room. She apologies for addressing them as a
group, if they aren't already associated.

Two seasons ago, _Abeth Harbrook_ first heard rumors of a "king," from
travelers that claimed they were mugged on the _trade road_. At first
she dismissed the claims as exaggerations. She thought they wanted to
get out of paying guild tariffs.

Last season, livestock began to disappear from local farms. Barns and
silos were painted to say "_King Bark_ Was Here" and "_Idbol Bark_ Is
King."

Recent attempts to arrest the "king" failed, but revealed the location
of his hideout: _Jacob's Folly_, a short tower built eight miles
outside of town.

**_How does the party plan to capture_ King Idbol Bark?**

If the party **risks** interrogating _Abeth Harbrook_, she may include
that victims claimed the bandits were exceptionally tall and wore
masks. She withheld this information because she thought it was an
exaggeration.

An adventurer **knowledgable** about _goblin_ culture may recognize
_"Bark"_ as a _goblin_ surname.


##### Scene Two: Travel to the Tower {#scene-two}

_Jacob's Folly_ is approximately eight miles from _Belcaer_. Six of
those miles are northwest along the _trade road_, The final two
are through shallow marsh, broken by massive limestone outcroppings.

**_How does the party get to Jacob's Folly?_**

If traveling at night or in inclement weather, the party **risks**
getting lost, though **knowledge** of navigation would help.

If the party travels quietly (such as at night or in inclement
weather,) as they approach the tower, they will remain undetected
until reaching "Scene Three."

Otherwise, they will be met by a group of "bandits" on the road, who
declare, in sqeaky rough voices, that declares they are in the
territory of _King Bark_, and must surrender their money and supplies.

Each bandit is actually two _goblins_ in a long cloak, one standing on
the others shoulders and wearing a mask.

**_How does the party handle these "bandits"?_**

If the party has horses or other livestock, the goblins will attempt
to steal these even if the party refuses to surrender. Otherwise, they
are more inclined to run than fight. If captured, they will happily
give the party directions to _Jacob's Folly_, saying that _King Bark_
would be happy for them to come bend the knee.


##### Scene Three: The Tower Exterior {#scene-three}

The limestone outcroppings in the marsh hide _Jacob's Folly_ until the
party is nearly there.

The limestone tower is three-storeys, and approximately twenty-five
feet tall and ten feet across. It is in a clearing about fifty yards
across. The tower's entrance has been sealed with the same limestone
bricks as the tower. There are a couple of windows near the top. Pine
planks, five on each side, are shoved into the mortar. They form an
unstable ladder up to the windows.

_Goblins_ are working around the tower, tearing grass out of the muck
and stuffing it into sacks. There is a burnt-out bonfire with horse
bones in it.

**_How does the party get into Jacob's Folly?_**

When a member of the party moves into the clearin,g any goblins near
them will quietly move toward the tower, informing others on the way.

Some goblins will remain outside the tower, hiding behind rock
outcroppings in the field and throwing stones and debris at the party.
If the party **risks** engaging with any of those _goblins_, goblins at
the top of the tower will have time to start burning straw on the roof
the tower, which they will drop on the party when they approach the
bottom of the tower.

If approaching in the evening, the party **risks** being noticed by an
owlbear mother that nests on the top of the tower, who will swoop down
and harass them, making the _goblins_ aware of them. The _owlbear
mother_ will attempt to carry any small (<120lb) adventurer into its
nest, where two hungry _owlbear hatchlings_ are waiting for them.

Placing more than 120lb on any single rung of the goblins' improvised
ladder is **risk**, with every 20lb making it **riskier**. Depending on
the result, a rung could loosen or break. The adventurer might gain a
fear of heights, or could fall, and even break a bone.

An adventurer who gets to the roof of _Jacob's Folly_ would be able
to take those _hatchlings_ and raise them, but unless the _mother_ is
killed, she will follow her hatchlings to the ends of the world and
try and get them back.


##### Scene Four: The Tower Interior {#scene-four}

The inside of the tower is dark, stinky, and beginning to fill with
acrid smoke.

When the party enters the room at the top of the tower, through the
window on the third storey, they'll find an empty room with some
sticks, dry piles of dung, buckets, and a large brass dish that's
clearly been used for fires, and might still have straw burning in it.
The goblins will retreat down underneath the trap door on the ground
floor.

There are two other "floors" inside the tower, though they are empty
except for more dirty straw and dung. There is a large, heavy wood
door in the floor at the ground level.

Once the party has entered the tower, all the goblins are underneath
this trap door, and have removed the ladder normally placed under it.
To get to the floor below is a seven-foot drop.

Smoke rises through the trapdoor, filling the tower with thicker
smoke that makes every risk riskier.

If the party is on the ground floor during the daytime, they will see
light entering the room through cracks in the filled-in doorway. A
**strong** character might **risk** knocking the mortar down, letting the
smoke out of the tower.

Opening the trapdoor exposes the party to further harassment from the
goblins, but provides an opportunity for dialog. The goblins will
call the party cowards, and say that if they come down there, _King
Bark_ is going to get them.

**_How does the party get to_ King Bark?**


##### Scene Five: The Tower Basement {#scene-five}

The room is circular, a bit wider in diameter than the tower above,
and is full of farm tools and preserved foodstuff and grains.

Among the approximately two-dozen goblins in this room is one wearing
a "crown" made of twisted-together silverware: _Idbol Bark_, leader of
this group of goblins.

**_How does the party capture King Bark?_**

The goblins have no further means of retreat, so will fight until
unable. King Bark has no exceptional combat skills, and no goblin is
armed with anything more than farm and kitchen tools.


#### Epilogue {#epilogue}

Once _King Bark_ and his goblins have been captured, disbanded, or
eliminated, the party should return to _Belcaer_ and tell _Abeth
Harbrook_ what happened, and potentially turn over custody of King
Bark and other goblins to her custody.

-   How will _Abeth Harbrook_ react to claims or evidence of _goblins_?
-   Who has possession of the _Crown of Idbol Bark_? Each utensil in it
    was magic in some way, though they're inactive now. To the right
    person, or in the right future, it might be quite valuable.


## Essays {#essays}


### What Is Teraum? {#what-is-teraum}

At its heart, Teraum is a fiction. It's been a part of my life since I was a young child: it was the place where adventures were set. It was always kind of a silly place, with wizards who liked to play pranks, and knights who fell in the mud when trying to mount their horses.

As I grew, so did the place where adventures were set. I wrote stories set there: short, long, funny, mysterious, scary stories. The fiction became more concrete. Cities gained names, empires were assigned histories, and heroes learned about themselves.

The world itself gained a name, Tero kun thaum. Butchered Esperanto and freshly vulgarized Latin, the name means "Earth with magic." Eventually it was shorted to "Teraum."

Much of what was concrete about Teraum was lost in the chaos of early adulthood, but in recent years I've had an interest in coming back to it.


#### Teraum's Calendar {#teraum-s-calendar}

The calendar used by most everyone on Teraum has 365.25 days each year (just like ours,) 12 months each year (just like ours,) and the annual seasons (just like ours.)


#### A Brief History of Teraum {#a-brief-history-of-teraum}

Around 54,000 years ago, the gods from across the multiverse got together. They were having an issue managing the various creatures, plants, artifacts, and other such creations that came from being gods. They came up with the plan to store their excess and unwanted creations in, essentially, a vast zoo and museum. This would keep the things and creatures out of the way, while still letting the gods show them off to one another.

As the museum was a rather industrial-looking place full of corridors and different habitats and archives, the gods decided to build a proper planet around the museum, with oceand and continents, pine trees and salmon, a sun and moon, that sort of stuff. The world was named Teraum, though the etymology in Earth languages is coincidental, and the museum underneath it was named the Worldkeep.

It didn't take long before the gods got bored of the Worldkeep and stopped visiting. The complex began to fall into disrepair. About 30,000 years , the walls between the Worldkeep and the rest of Teraum began to fracture. The first creatures to escape the Worldkeep were giant spiders.

Soon more creatures followed, setting up homes for themselves across the geography of Teraum. With them, magic, a physical substance imbued in the Worldkeep, began to enter the world, working its way through the ground like veins of ore.

-    Humans on Teraum

    Humans were put inside the Worldkeep along with the other species, but they're quite a bit different. The others, elves, halflings, goblins, talking trees, they're all magic. They have magic in their blood, or sap, and it makes them special in whatever way they're special.

    Humans are not magic. They are mundane. In many parts of the multiverse, those universes that are mundane, this enabled humans to thrive where other sapient life would fail, since the didn't rely on magic to be clever.

    But in Teraum, a world rife with magic, humans were at a disadvantage. They were still able to escape the Worldkeep, but they were unable to hold land agianst any of the more powerful magic races. They were forced to be travelers surviving off what they could forage.

    Despite the relative difficulty, humanity managed to spread across a large partof the world, and over time gained a foothold in the region that would become known as the Green Delta. (From here on, I'll use a place's contemporary name, unless there's good reason otherwise. I'll cover what contemporary means shortly.

    With permanent settlements, humans began to cultivate and shape their environment, and soon had the resources to challenge their nearest neighbors: the goblins in the southward Widewoods, and the hill dwarves in the eastward Central Plains.

    As the human's settlements grew, they found themselves with novel problems. Cities were racked with disease, class exploitation was rampant, and humanity found itself unable to expand any further.

-    Brief History of the Magic Revolution

    It's unclear, that is, I've written contradicting explanations of, how humans came to use magic, but at some point about one-hundred fifty years ago, a clever human realized if you put magic under pressure, it got hot.

    Magic quickly became the fuel for foundries which churned out vast quantities of increasingly pure steel, and some humans even learned how to do more, well, magic things, with magic.

    The period was known as the Magic Revolution, and it was a time when humans, for the first time in Teraum's history, felt as though they were equals to the other species. Their prosperity allowed their largest city, Ack, to become the largest port in the known world, and catalyzed the development of financial and civic sciences.

-    A Brief History of the Breaking

    After nearly a century of growth, humans learned something new about magic.

    If too much magic is gathered in one place, such as in a bank vault, it causes all magic to use itself up. this happened, in an event called the Breaking.

    Magic is difficult for intelligent species to predictably use. When magic uses itself, the results are beyond unpredictable, well into the realm of improbable. I'll skip the details of the Breaking for now, to focus on the most important effect.

    Elves, dwarves, goblins, halflings, orcs, and giants spiders are all amgic creatures. They need magic to survive, and without it, the species' lose their "spark."

    Many died. Many became abominations, twisted by their magic, and were killed by fearful humans seeking survival.

    Some, the less magic, were left less changed. Elves became feral, hunting their vast forests like packs of wolves. They hunted down the halflings, who became docile and dumb, until there were no more halflings. The dwarves, long-since pushed back to the mountains by human expansion, were inaccessible past their giant fortress doors.

    But, humanity was mundane, so they survived the Breaking. The survivors had children, and these children grew up in a world filled with riches that were absolutely free for the taking. Humans moved ontot he halflings' farms, raided old goblin hordes, and used the riches to rebuild.

    This led to a period of war between the factions of humanity, which continues to the contemporary era, eighty years after the Breaking.

    Parts of the world are entering a new era of peace and prosperity, under the banner of the Red Union, but there are rumors that, in the more wild corners of the world, magic is coming back.


#### A Very Brief Summary of Teraum {#a-very-brief-summary-of-teraum}

Magic is a physical substance, and there are lots of magic creatures on the planet that got there from the Worldkeep, a museum-zoo buried deep underground. There are humans too, but they're not magic. But, they learn to use magic. Then they cause an apocalypse for everyone but themselves and are struggling to deal with that.


## Narratives {#narratives}


### Tales from Teraum #1: "The Man with Light" {#tales-from-teraum-1-the-man-with-light}


#### Scene One {#scene-one}

Ben didn't dislike his job, even on days like this, when it seemed like the clouds were working overtime to pull up the ocean and drop it on his head. The pay was enough to keep him living on the north side of the river, and just last week he'd let out his belt another notch.

The work was simple enough: maintain the lampposts on the few blocks he had been assigned to. Usually that just meant refilling the oil and replacing wicks. If a lantern was damaged, he would mark it with a stick of chalk.

Ben's route took him through the back corners of the city's Brass Ward, where bureaucrats and craftsmen maintained the industry that supplied the ward's high street with goods for sale. He preferred it to the busier streets, and with today's rain, the streets were nearly empty.
\#+END

---

One of Ben's favorite buildings on his route was 114 Caliper Street. A lean wooden building, its black paint put it in contrast to the brightly painted workshops of jewelers and offices of accountants that surrounded it.

Unlike many buildings around, it had no banner or sign, except its numberplate, and its windows were shuttered closed. For the past few months, cerulean light had leaked through those shutters, and on rainy evenings like this, the brick street cast the light back up, giving every passerby a pallor.


#### Scene Two {#scene-two}

114 Caliper Street was the home and workshop of Dr. Altar Sendvogue. He, himself, had been a lampworker in the Brass Ward as a younger man. But he hadn't enjoyed his job as much as Ben did, and was always looking for shortcuts. He'd created the small gears that let him turn a screw to lengthen the wick, and he had been promoted.

In the time since he'd invented better glass panels.


## Supplements {#supplements}