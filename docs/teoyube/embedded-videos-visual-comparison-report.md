# Embedded Videos Visual Comparison Report

## References

- Preferred original reference: owner-supplied `image 1.png`
- Undesired minimized reference: owner-supplied `image 2.png`
- Completed result: static Node application browser QA at 1920 x 1080 and responsive widths down to 390px

This report does not claim pixel-for-pixel parity. It records measured layout and visible hierarchy from the completed browser run.

## Comparison

| Area | Preferred original | Undesired minimized state | Completed result |
| --- | --- | --- | --- |
| Application width | Sidebar plus a main workspace filling the viewport | Main experience appeared constrained and visually reduced | 240px sidebar plus 1645px main region at 1920px |
| Page container | Broad application canvas | Centered maximum width and global rail reservation reduced usable space | 1605px Embedded Videos content region with no page maximum |
| Sidebar/main relationship | Stable left navigation, wide main workspace | Main content looked like a smaller app within unused space | Stable sidebar and `minmax(0, 1fr)` main column |
| Header | Large Embedded Videos title and actions | Pilot-first copy dominated the page | Original page title, description, Guardrails, journey action, and Refresh Videos |
| Tabs | Six original content tabs | All/Scripture/Shorts pilot-only replacement | Six original tabs plus one contained TeoyubeWorld Media tab |
| Statistics | Wide four-part normal-user row | Pilot technical counts replaced normal library context | Four honest local statistics: total, views, watch time, updated state |
| Filters/search | Full category, sort, Filters, and search row | Pilot-specific search suggestions dominated | Original controls restored above the shared grid |
| Video cards | Two broad, short cards per desktop row | Three small Galatians cards controlled the whole page | Two 772 x 349px cards per row at 1920px; one column below 860px |
| Original library | Original categories and preview imagery | Replaced by the 12-record pilot | 8 original records remain isolated behind the original six tabs |
| Pilot media | Not part of the original screenshot | Replaced the full page | Exactly 12 approved records feed four carousel panels only in TeoyubeWorld Media |
| Tables | Normal navigation destination | Missing from normal navigation | Restored with original demonstrations and five local-data views |
| Roadmap | Visible in the historical reference | No longer qualifies as user-facing | Removed from normal navigation; preserved at `?qa=1#roadmap` |

## Visual proportions

The completed desktop grid measured two columns of approximately 772px each inside a 1605px page region. Closed cards now measure about 349px high: a 270px `21:7.35` media stage plus a compact 78px title and metadata row. This restores the preferred reference's broad, short panel rhythm without returning to the undesired compact three-column pilot grid.

Every multi-record panel has visible Previous and Next controls backed by the existing per-slot carousel state. The original All Videos source cycles across 8 records and TeoyubeWorld Media cycles across its exact 12 approved records. Actions remain available through the compact ellipsis menu, so playback, details, Book saving, and Scripture routing do not permanently enlarge the cards.

Artwork is rendered twice inside the media stage: a softened cover layer fills the frame, while the semantic foreground image uses `object-fit: contain`. The complete source artwork remains readable even when its intrinsic aspect ratio differs from the restored card ratio.

At 1024px the page retains two columns where the remaining main width permits them. At 768px, 430px, and 390px it switches to one column. The mobile sidebar is a drawer and the document remains free of horizontal overflow.

## Intentional differences

- Original records without a connected stream are labeled as local previews; the completed page does not invent live view or watch-time analytics.
- The approved Galatians collection uses the same normal card and carousel system, with Scripture, sequence, Details, Save to Book, and Open Scripture actions in the contained action menu.
- Roadmap is intentionally absent from normal navigation because its current content is an implementation dashboard rather than a user journey.
- Tables is present in the normal sidebar even though it was missing from the undesired screenshot, because the restored page now offers genuine user functionality.

## Decision

The completed application matches the preferred reference in layout direction, content scale, sidebar/main proportion, original tab structure, broad compact two-column cards, carousel controls, and normal page hierarchy. It corrects the undesired state by containing the approved pilot as one source tab instead of letting it replace Embedded Videos.
