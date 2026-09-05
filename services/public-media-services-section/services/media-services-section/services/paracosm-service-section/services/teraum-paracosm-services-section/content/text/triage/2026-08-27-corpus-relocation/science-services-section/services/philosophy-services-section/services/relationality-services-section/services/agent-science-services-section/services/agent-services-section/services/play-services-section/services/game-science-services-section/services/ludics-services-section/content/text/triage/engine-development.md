#+TITLE: Engine Development Guide
* Explainers
** Teraum's MUD Stack
In this post I'd like to explain the /MUD stack/ behind *Teraum*.

*/Teraum/* is a /MUD server/ running the *Racket-MUD* /engine/ loaded with the *RPG-Basics* /library/ and a custom /map/.

Phew! Lot of terms.

- A */MUD server/* is a single MUD, running somewhere. Folk can connect to it, create accounts, and do whatever that server allows.

- A */MUD engine/* is a piece of software that provides the game engine for running a MUD server. It usually doesn't come with too many game-like features itself, usually focused around providing connectivity and utilities.

- A */MUD library/* is a collection of code meant to be added into a *MUD engine* to extend its features.

There's our generic terms.

- */Racket-MUD/* is a /MUD engine/ that's made by the same people who are making *Teraum*. It's written in the /Racket/ programming language. It's about two hours older than the *Teraum* MUD, so is also in the very early stages of development.

- */RPG-Basics/* is a /MUD library/ that's being made by us same folk who are making *Teraum* and *Racket-MUD*. It's the first /library/ being made for *Racket-MUD*, and as such, its code isn't well-segregated from the /engine/.

Under-the-hood, the /engine/ is just a procedure for handling the scheduling and sequential calling of */events/*, another type of procedure for manipulating the state of the game world. When the engine is ~made~, it's usually passed a list of /events/ to call when it first starts. For example, *Racket-MUD* comes bundled with /events/ for creating, loading, and saving user accounts, managing intra-engine user chat channels, and running the socket server to which those users will connect.

A /library/ is a similar bundle of /events/. The *RPG-Basics* /library/ currently provides events that load the world map and set up the ability for those created things to randomly act.

In practice, starting the MUD is done with the following line of Racket:

#+BEGIN_SRC racket
(run-engine
 (make-engine "Teraum"
  (list (accounts)
        (mudsocket)
        (talker)
        (actions)
        (mudmap teraum-map))))
#+END_SRC

-----

As *Teraum* increases in sophistication, the number of /events/ passed when the /engine/ is ~made~ will steadily increase, but the basic concept is there: pass a list of procedures to the engine to serve as the first /events/.

In follow-up posts, I plan on explaining how each of these events work, and providing a more thorough explanation of what ~making~ an /engine/ actually means. Also, what goes into the ~teraum-map~: how are in-game things represented, as source code.
* Project Management
** Flow

#+BEGIN_SRC sh
git flow feature start womble
#+END_SRC

This creates a new git branch, ~feature/womble~, based on the ~develop~ branch. Once you’re on the feature branch, you can make whatever changes to the code you want. Let’s pretend I added a ~womble~ command.

#+BEGIN_SRC sh
git flow feature finish womble
#+END_SRC

#+BEGIN_SRC sh
$ git flow release start 0.0.4
$ git log --pretty=format:'- [[http://gitlab.com/emsenn/racket-mud/commit/%H][view commit]] - %s' > docs/changelog.org
$ cd ./docs && make html && cd ..
#+END_SRC

#+BEGIN_SRC
git flow release finish 0.0.4
git push --all
#+END_SRC

** Commits

Here's the format
#+BEGIN_SRC
action: [audience:] Summary Of Commit [!tag]
#+END_SRC

- ~action~ represents what purpose the commit serves and is one of:
  - ~chg~ - You’ve refactored existing code, removed technical debt, or expanded test coverage
  - ~fix~ - You’ve fixed an issue. Ideally, prove the GitHub Issue # in the summary.
  - ~new~ - You’ve added new features, documentation, or test cases.
- ~audience~ represents who would care about the change (and is optional, but recommended)
  - ~dev~ - API revisions/additions, refactors
  - ~usr~ - Client experience revisions/additions
  - ~pkg~ - Packaging/metadata revisions/additions
  - ~test~ - Test case revisions/additions
  - ~doc~ - documentation revisions/additions

- ~Summary Of Commit~ is a short (very short) summary of what the commit does. If you find yourself struggling to come up with this, you probably should be committing more frequently. Capitalize every word, unless it references a part of the code which is not capitalized.

Each tag should be prefixed with an exclamation point, (is optional,) and should be one of:
- ~!refactor~ marks that the commit deals with existing code.
- ~!minor~ marks that the commit has a very minor change - adding a one-line comment or fixing a typo.
- ~!cosmetic~ marks a commit as dealing with code practice adhesion - fixing pep8 violations or other small stuff
- ~!wip~ marks a commit as being a work-in-progress - the committed code is functional, but doesn’t contain all of the eventual changes the function will require.

If it wasn’t clear from the tags, commits should have a single thing that they deal with. My commit for my new womble command might look something like this:

#+BEGIN_SRC sh
git commit -m "new: usr: Addition Of Womble Command !wip"
#+END_SRC
Once you’ve committed the functional code, it’s time to test it.

** Issues & Milestones
*** Issue Management
**** Creating Issues
**** Managing Issues
*** Labels
*** Milestones
