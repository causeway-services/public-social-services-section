---

title: qtMUD
created: "2025-08-19"
---

## Overview
qtMUD is a basic MUD engine written in Crystal that uses a literate programming workflow. It aims to guide non-programmers through building text-based online games and is currently in an early alpha planning stage.

## Scope and Expectations
- The engine is incomplete; expect edits and TODO markers such as DEV, DRAFT, EDIT, REVIEW, TEST, or TK.
- Documentation focuses on pedagogy alongside runnable code, with encouragement to download and tangle the source locally.
- qtMUD is intended to pair with a MUD library (for example, Fyreside) to provide playable game content.

## Approach
- Written by emsenn for public use under the included license, with an invitation for feedback via public or personal email.
- Implemented as a literate program where prose embeds code blocks extracted during the build process.
- Designed as a shard-style Crystal project so the core server can be reused by other projects.

## Engine Operations
### Install from Org-mode
```sh
rm -r ./build/qtmud/
mkdir -p ./build/qtmud/{spec,src}
```

### Configure
```yaml
name: qtmud
description: A MUD engine; run text-based online role-playing games.
version: 0.1.0

authors:
  - emsenn <emsenn@emsenn.net>

crystal: 0.28.0

license: MIT
```

### Test
```sh
cd ./build/qtmud
crystal spec --no-color > test_results.tmp
cat test_results.tmp
rm test_results.tmp
```

## Crystal Specification
```crystal
require "spec"
require "../src/qtmud"

describe Qtmud do
  # TODO: Write tests

  it "works" do
    false.should eq(true)
  end
end
```

## Crystal Source
```crystal
# TODO: Write documentation for `Qtmud`
module Qtmud
  VERSION = "0.1.0"

  # TODO: Put your code here
end
```

## Engine Cycle (Narrative Summary)
- Loads MUD services, registers subscribers, and collects tickable functions before enabling optional features.
- Starts services (for example, socket binding) and runs a game tick loop that triggers subscriptions and shuts down gracefully when stopped.
- Players connect via a MUD client, creating or loading an account thing whose qualities drive how services and events apply.
- Developers build libraries of things, qualities, services, and subscriptions; the engine aims to keep this approachable for newcomers.

## Development Log Highlights
- Describes reimplementing the Python prototype in Crystal after studying the Crystal Reference.
- Documents a minimal Org-mode workflow: rebuild directories, tangle source blocks, and run the test script to see failing specs.
- Notes the intention to host the shard on Sourcehut rather than GitHub.

## License
```
Copyright 2019 emsenn

Permission is hereby granted, free of charge, to any person obtaining a copy of this document and associated media files (the "Document"), to deal in the Document without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Document, and to permit persons to whom the Document is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

The Document is provided "as is," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, or noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort, or otherwise, arising from, out of or in connection with the Document or the use or other dealings in the Document.
```
