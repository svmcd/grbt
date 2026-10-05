# Shirt designs

The product images on the site (Memleket, Hasret and Sinema) are rendered on demand. You never
make a mockup by hand: drop the artwork of a design in a folder and every product image
(T-shirt, long sleeve, hoodie and sweater, in every colour of `src/lib/garments.ts`, front and
back) is built from it.

```
designs/
  templates/
    logo.svg                          chest logo, printed on every garment and on the neck label
    tshirt/<front|back>-<color>.png   blank Cloprod T-shirt TS0CI, 1600x1600
    hoodie/<front|back>-<color>.png   blank Cloprod hoodie HD0C4, 1643x1643
    sweater/<front|back>-<color>.png  blank Cloprod sweatshirt SS0C3, 1600x1600
    longsleeve/<front|back>-<color>.png  blank Cloprod long sleeve LS0IS, 1600x1600
  memleket/
    <slug>/                  one folder per design, e.g. konya, sanliurfa
      photo.jpg              the photo inside the frame on the back
      name.svg  (or .png)    the city name under the photo
      plate.svg (or .png)    the plate number on the left sleeve
  hasret/<slug>/             gurbetten-memlekete, sıla-yolu, yabanci
  sinema/<slug>/             devam, recep_to_my_sibel, sensiz_olmaz, sibel_to_my_recep
  turkish-time/<name>/       cay, kurt (product slugs turkish-time-cay, turkish-time-kurt)
      source.png             the artwork as delivered: red drawing + white text on transparency
      art.png, text.png      the drawing (its red, with alpha) and the text (alpha mask)
      design.json            where each layer goes (see "Hasret and Sinema" below)
      photo.png              photo layer, exact crop
      caption.png, art.png   text / line art as an alpha mask (white on transparent)
      dot.png                sıla-yolu's red dot, printed red on every colour
      source/                the old flat Figma mockups the artwork was extracted from
```

`<color>` is the colour key from `src/lib/garments.ts` (siyah, beyaz, krem, ...).

## How the images reach the site

The site links to `/products/collections/<folder>/<slug>/<color>/<file>` (`<folder>` is
`memleket`, `hasret`, `recep_ivedik` for Sinema or `turkish-time`) with `<file>` one of
`front.png`, `back.png` (T-shirt), `hoodie_front.png`, `hoodie_back.png`, `sweater_front.png`,
`sweater_back.png`, `longsleeve_front.png`, `longsleeve_back.png`. `next.config.ts` rewrites those URLs to `src/app/api/mockup/`, which renders
the image (`src/lib/mockups/render.ts`) and returns WebP, cached for a year by the browser and
Vercel's CDN. Nothing is generated at build time and no rendered image is committed. Unknown
designs, colours or files give a 404. Extra photos such as `common1.png` stay real files in
`public/` and are served as they are.

To look at the images locally: `npm run mockups -- konya --sheet` writes every image of that
design to `.mockups/konya/<color>/` and a contact sheet per garment to `.mockups/konya-*.jpg`
(`npm run mockups` alone renders every design, `npm run mockups -- hasret sinema` one or more
collections).

## Adding a new design

1. In Figma, export three layers of the design:
   - the photo layer (portrait, about 660 x 776) as `photo.jpg` or `photo.png`
   - the city name layer as `name.svg`
   - the sleeve number layer as `plate.svg`
   Color does not matter: logo, name, number and frame are printed in the ink of each garment
   colour (`ink` in `src/lib/garments.ts`). The frame around the photo is drawn by the renderer.
   The same artwork is scaled onto the long sleeve, hoodie and sweater, and the sleeve number is turned to
   the sleeve angle.
2. Put them in `designs/memleket/<slug>/`. The slug is the URL name: lowercase, no Turkish
   characters (`sanliurfa`, `kahramanmaras`).
3. Add the product text: the slug to `memleketSlugs` and its description in
   `src/lib/catalog.ts` (Turkish), plus `src/i18n/catalog/en.ts`, `de.ts`, `fr.ts`.
4. Run `npm run mockups -- <slug> --sheet` and check the sheets, then `/product/<slug>`.

## Changing the shirt

- New logo: replace `templates/logo.svg`. Every garment of every design gets it.
- Moving the print: the positions are `PLACEMENTS` in `src/lib/mockups/render.ts` (back print
  origin and scale, chest logo, sleeve number, and the neck label that covers the supplier's
  tag; on the hoodie the label follows the hood folds per colour, on the long sleeve the tag
  sits a few pixels apart per colour).
- New colour or new Cloprod photos: add the colour to `src/lib/garments.ts`, then
  `npm run blanks` (scripts/fetch-cloprod-blanks.mjs) downloads the photos and writes the
  templates (`npm run blanks -- longsleeve` for one garment type). Colours Cloprod has no photo for are tinted the way Cloprod's own mockup tool does.
- Rendered images are cached for a year under the same URL. After changing artwork or
  positions, a new Vercel deployment clears the CDN; browsers that already loaded an image keep
  their copy until it expires.

## Hasret and Sinema

Their artwork was extracted once from the old flat mockups in `<slug>/source/`
(`node scripts/extract-flat-artwork.mjs`, which also writes an overlay check per design to
`.mockups/extract/`: source, rebuilt from the extracted layers, difference). Photos are exact
crops; text and line art are alpha masks taken from the luminance against the solid garment
colour, so they print in the ink of each garment colour like Memleket's name and number.

`design.json` per side (`front`, `back`, or `null` when that side is blank) holds the print
`area` and its `layers` in pixels of the source mockup, each layer's `box` relative to the area:
`photo`, `mask` (garment ink), `color-mask` (fixed `color`) and `frame` (a line in the ink, as
thick as the Memleket frame). The renderer places them like this:

- front: the chest logo where Memleket has it, the print centred under it; the scale makes our
  logo as tall, relative to the print, as the logo on the source mockup (`reference.logoHeight`),
  and the print starts `reference.logoGap` source pixels under it
- back: `reference.memleketFrameWidth` source pixels are as wide as the Memleket back frame on
  that garment, the area's top is level with that frame's top, centred on the same line
- the neck label like every garment; no sleeve number

## Chest icon and Memleket photo colour

- The brand icon (`templates/icon.svg`) sits on the wearer's left chest (the right of the front
  image), about 4.2 cm tall, at `PLACEMENTS.<garment>.icon` in `src/lib/mockups/render.ts`.
  Memleket, Hasret and Turkish Time have it, Sinema does not (`COLLECTION_STYLE`). When a front
  print would run into it (yabanci's line of text), the icon moves down under the print.
- Memleket back photos are toned to the garment colour (`duotoneEnds` in render.ts): on dark
  garments the photo's black is the garment colour and its white a near-white with a touch of
  the garment's hue; on light garments its white is the garment colour and its black a deep shade
  of the same hue. Black and white garments keep a plain black-and-white photo.

## Turkish Time

Sold as T-shirt and long sleeve only (`garments` in design.json; `productTypesFor` in
`src/lib/catalog.ts`). `node scripts/extract-turkish-time.mjs` splits each `source.png` into
`art.png` and `text.png` (the drawing under the letters is filled from its surroundings), writes
`design.json` and an overlay check to `.mockups/extract/`. The back print is as wide as the
Memleket frame and level with its top. The text prints in the garment's ink; the drawing prints
in its red unless the red's contrast with the garment colour is under `minContrast` (1.7), then
in the ink too. Where the text crosses the drawing and the ink does not stand out against it,
the drawing is cut back around the letters.
