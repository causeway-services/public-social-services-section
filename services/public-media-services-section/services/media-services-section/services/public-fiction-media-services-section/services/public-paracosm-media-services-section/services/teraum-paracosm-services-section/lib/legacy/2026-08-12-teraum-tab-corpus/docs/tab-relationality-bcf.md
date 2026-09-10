---
title: TAB
id: a6e6b071-b2ff-4fdc-8312-84b01f95896d
type: doc
status: draft
created: "2025-09-15"
authors:
  - emsenn
form: "MUD engine"
public: true
---

## Documentation
TAB is a Fennel-powered MUD engine built with Org-mode tangling. The original Org file organized the project into documentation, engine code, library models, and supplements for source files.

## Engine Configuration and Header
```fennel
(local fennel (require :fennel))
(local conf (require :conf))
(local tab {:view fennel.view
            :eval fennel.eval
            :doc fennel.doc})
```

## Utilities
### Logging
```fennel
(local log-levels {:critical 1 :error 2 :warning 3
                   :info 4 :debug 5 :spam 6})

(fn tab.log [level ...]
  {:fnl/docstring "Print MESSAGE (can be more than one string) if LEVEL is equal or greater to the configured log level."
   :fnl/arglist [level message]}
  (fn print-message [message]
    (print (.. (tab.render-time (os.time) true)
               "> " level
               (if (= level :error) ":    "
                   (if (= level :warning) ":  "
                       (if (= level :info) ":     "
                           (if (= level :debug) ":    "
                               (if (= level :spam) ":     "
                                   ": ")))))
               message)))
  (when (>= (. log-levels conf.log-level)
            (. log-levels level))
    (print-message (tab.concat ...))))
```

### Strings
```fennel
(fn tab.concat [...]
  (let [stab (table.pack ...)
        A (tab.make-string-appender)]
    (set stab.n nil)
    (each [_ str (pairs stab)]
      (A str))
    (A)))
```

```fennel
(fn tab.make-string-appender [?sep]
"Return a function that holds a string and accepts one additional argument (string or list of strings). If provided, the argument is appended to the held string, with SEP appended (to each one, if its a list of strings.)"
(var o "")
(lambda [?a]
  (lambda q [r]
    (set o (.. o r (or ?sep ""))) o)
  (if ?a
      (if (or (= (type ?a) :string)
              (= (type ?a) :number))
          (q ?a)
          (each [_ v (pairs ?a)]
            (q v)))
      o)))
```

```fennel
(fn tab.quibble-strings [strings ?resort ?oxfordize]
  "Return the sequence of STRINGS separated with commas and the conjunction 'and'. ?OXFORDIZE is currently irrelevant; strings are oxfordized by defualt."
  (let [oxfordize (or ?oxfordize true)
        o (tab.make-string-appender)]
    (when ?resort (table.sort strings))
    (var join "")
    (for [count 1
          (length strings) 1]
      (if (= count (length strings))
          (set join "")
          (= count (- (length strings) 1))
          (set join
               (.. (if (and oxfordize
                            (> (length strings) 2))
                       ","
                       "")
                   " and "))
          (set join ", "))
      (o [(. strings count) join]))
    (o)))
```

```fennel
(fn tab.split-string [string ?sep]
(let [words []
      matcher (string.gmatch string (or ?sep "%S+"))]
  (var done? nil)
  (while (not done?)
    (let [word (matcher)]
      (if word
          (table.insert words word)
          (set done? true))))
  words))
```

## Engine IDs and REPL
```fennel
(fn tab.make-id [?existing]
  (math.randomseed (os.time))
  ...
  (print "Starting TAB REPL")
  (iface.repl.start {:tab tab :socket socket :mime mime}))
```

## Library Models
### Thing Model
```fennel
{:name :thing
 :behaviors [:thing]
 :additive-attributes [:additive-attributes :behaviors]
 :grammar {:pronouns {:subject :it
                      :object :it
                      :determiner :its
                      :possessive :its
                      :reflexive :itself
                      :first {:subject :I
                              :object :me
                              :determiner :my
                              :possessive :mine
                              :reflexive :myself}
                      :second {:subject :you
                               :object :you
                               :determiner :your
                               :posessive :yours
                               :reflexive :yourself}}}}
```

## Behaviors
### Thing Behavior
```fennel
(local fennel (require :fennel))
(local tab (require :tab))

(local thing {})

(fn thing.fname [thing]
  (.. (if (and thing.grammar
               thing.grammar.article)
          (.. thing.grammar.article (if (> (length thing.grammar.article) 0)
                                        " "
                                        ""))
          (if (tab.find-element [:a :e :i :o :u] (string.lower
                                                  (string.sub thing.name 1 1)))
              "an "
              "a "))
      thing.name))

(fn thing.describe [thing]
  (if thing.description
      thing.description
      (.. "This is " (thing:fname) ".")))

(fn thing.name=? [thing term]
  (= thing.name term))

(fn thing.noun=? [thing term]
  (let [phrase (tab.split-string term)
        noun (. phrase (length phrase))]
    (when (and thing.grammar
               thing.grammar.nouns)
      (or (= noun thing.name)
          (tab.find-element thing.grammar.nouns noun)))))

(fn thing.adjectives=? [thing term]
  (var mismatch nil)
  (let [phrase (tab.split-string term)
        adjectives (if (> (length phrase) 1)
                       (do (table.remove phrase (length phrase))
                           phrase)
                       nil)]
    (when (and adjectives
               thing.grammar
               thing.grammar.adjectives)
      (each [_ adjective (pairs adjectives)]
        (when (not (tab.find-element adjectives adjective))
          (set mismatch true))))
    (not mismatch)))

(fn thing.term=? [thing term]
  (or (thing:name=? term)
      (and (thing:noun=? term)
           (thing:adjectives=? term))))

thing
```

## Supplements
### tab.fnl tangle target
```fennel
<<tab-header>>
<<logging>>
<<concat>>
<<make-string-appender>>
<<quibble-strings>>
<<split-string>>
<<make-id>>
<<underline>>
<<render-time>>
<<scan-directory>>
<<save-file>>
<<load-file>>
<<load-folder>>
<<collect-keys>>
<<list-values>>
<<add-values>>
<<remove-values>>
<<clone-table>>
<<find-element>>
<<drop-dupes>>
<<reverse-list>>
<<find-by>>
<<lookup-behavior>>
<<load-attributes-file>>
<<clone-attributes-from-file>>
<<collect-bases>>
<<merge-models>>
<<make-thing>>
<<seatch-things-by-term>>
<<filter-things>>

  tab
```
