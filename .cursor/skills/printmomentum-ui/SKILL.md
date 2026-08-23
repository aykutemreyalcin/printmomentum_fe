---
name: printmomentum-ui
description: PrintMomentum UI product rules. Use when building listing feed, filters, ranking copy, empty states, or Etsy outbound links.
---

# PrintMomentum UI

Audience: print-on-demand sellers finding **printable tee designs that are heating up**.

## Screens (in order)

1. Feed of ranked listings (default).
2. Filters: print-tee only (default on), min score, max days-to-top, price, taxonomy.
3. Detail drawer/page: title, shop, price, tags, `days_to_top`, snapshot sparkline, Etsy link.

## Copy

- Rank is **momentum**, not "Etsy bestseller badge".
- Show `days to top` and `favorers delta`. Never invent sales counts.

## UX

- Cards: image, title, price, momentum badge, days-to-top.
- Outbound Etsy links: `target="_blank"` + `rel="noreferrer"`.
- Empty: "No printable tees match. Widen filters."
- Error: show API problem title, retry button.
- Loading: skeleton cards, not a blank page.

## Do not

- Scrape Etsy from the browser.
- Hide the print-tee filter by default.
- Sort by listing age only.
