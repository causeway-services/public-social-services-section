---
type: place
name: "Slade Street"
description: "Slade Street is a street in Bellybrush, with apartment buildings, a steamworks, a netmaker, a cobbler shop, a barber-surgeon, an aged-sausage butcher, and a noodle shop along its four blocks."
behaviors: [region, brusher]
contents: [slade-street-1, slade-street-2, slade-street-3, slade-street-4, redbrick-flats, steamworks, netmaker, kalduras-house, cobblers, ramen-shop, butcher, moneychanger, barber-surgeon]
in-region: bellybrush
---

## Consolidated material from slade-street-4.md

Structured claims from source frontmatter:

```yaml
type: place
name: "Slade Street"
description: "The east end of Slade Street in Bellybrush, just west of Hawk Street, with a moneychanger northwest, a barber-surgeon southeast, a butcher south, and a noodle shop southwest."
visual-description: "This is the east end of Slade Street, just west of Hawk Street. To the northwest is a moneychanger, to the southeast is a barber, to the south is a butcher, and to the southwest is a noodle shop."
behaviors: [area, brusher]
in-region: slade-street
exits:
  west: slade-street-3
  east: hawk-street-2
  southeast: barber-surgeon
  south: butcher
  southwest: ramen-shop
```

## Consolidated material from slade-street-3.md

Structured claims from source frontmatter:

```yaml
type: place
name: "Slade Street"
description: "A stretch of Slade Street in Bellybrush, with a shoe store to the north, a large house to the south, and a netmaking store to the southwest."
visual-description: "Slade Street runs east and west from here. To the north is a shoe store. To the south is a large house, and to the southwest is a netmaking store."
behaviors: [area, brusher]
in-region: slade-street
exits:
  east: slade-street-4
  west: slade-street-2
  north: cobblers
  south: kalduras-house
  southwest: netmaker
```

## Consolidated material from slade-street-2.md

Structured claims from source frontmatter:

```yaml
type: place
name: "Slade Street"
description: "A stretch of Slade Street in Bellybrush, with an apartment building to the north and a store to the south."
visual-description: "Slade Street runs east and west from here. To the north is an apartment building and to the south is some sort of store."
behaviors: [area, brusher]
in-region: slade-street
exits:
  east: slade-street-3
  west: slade-street-1
  north: redbrick-flats
  south: steamworks
```

## Consolidated material from slade-street-1.md

Structured claims from source frontmatter:

```yaml
type: place
name: "Slade Street"
description: "Slade Street just east of the Kingsroad in Bellybrush, with Vickers Street to the north."
visual-description: "This is Slade Street, just east of the Kingsroad. Vickers Street is north of here, and Slade Street continues to the east."
behaviors: [area, brusher]
in-region: slade-street
exits:
  east: slade-street-2
  west: kingsroad-4
  north: vickers-street-2
```
