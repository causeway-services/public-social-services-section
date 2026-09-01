---
type: thing
name: "cotton trousers"
description: "A simple pair of cotton trousers — a parameterized clothing template that varies by color and by plain or tattered style."
visual-description: "This is a simple pair of brown cotton trousers."
behaviors: [object, lookable]
nouns: [trousers]
adjectives: [plain, simple, brown]
located-in: bellybrush
---

Designer note: this is a parameterized clothing template defined in
`bellybrush/main.rkt`. It accepts `style` (plain or tattered) and
`color` arguments — tattered variants have torn seams and small fabric
tears. One brown plain instance is captured here; other instances
would be generated as needed by the engine.
