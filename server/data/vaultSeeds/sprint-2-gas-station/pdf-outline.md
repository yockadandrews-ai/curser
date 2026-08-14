# PDF Outline — Gas Station Snack Rankings

1. **Cover** — title + "rank your road stop"
2. **How to score** — exclusivity / crunch / regional pride / hot take weights
3. **Northeast bracket** — 8 slots + write-in
4. **South bracket**
5. **Midwest bracket**
6. **West bracket**
7. **Road Trip Wildcard** — national gas chain exclusives
8. **Blank master ranking page**
9. **Receipt footer** — copy block for IG/X proof post

Schema: {
  "format": "ranking_pdf",
  "pages": [
    "cover",
    "regional_brackets",
    "scoring_rubric",
    "blank_ranking",
    "receipt_footer"
  ],
  "scoring": {
    "exclusivity": {
      "weight": 0.35
    },
    "crunch": {
      "weight": 0.25
    },
    "regional_pride": {
      "weight": 0.25
    },
    "hot_take": {
      "weight": 0.15
    }
  },
  "regions": [
    "Northeast",
    "South",
    "Midwest",
    "West",
    "Road Trip Wildcard"
  ]
}
