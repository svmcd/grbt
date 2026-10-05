# Shirt designs

The Memleket product images on the site are rendered on demand. You never make a mockup by
hand: drop the artwork of a design in a folder and every product image (T-shirt, long sleeve,
hoodie and sweater, in every colour of `src/lib/garments.ts`, front and back) is built from it.

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
```

`<color>` is the colour key from `src/lib/garments.ts` (siyah, beyaz, krem, ...).

## How the images reach the site

The site links to `/products/collections/memleket/<slug>/<color>/<file>` with `<file>` one of
`front.png`, `back.png` (T-shirt), `hoodie_front.png`, `hoodie_back.png`, `sweater_front.png`,
`sweater_back.png`, `longsleeve_front.png`, `longsleeve_back.png`. `next.config.ts` rewrites those URLs to `src/app/api/mockup/`, which renders
the image (`src/lib/mockups/render.ts`) and returns WebP, cached for a year by the browser and
Vercel's CDN. Nothing is generated at build time and no rendered image is committed. Unknown
designs, colours or files give a 404. Extra photos such as `common1.png` stay real files in
`public/` and are served as they are.

To look at the images locally: `npm run mockups -- konya --sheet` writes every image of that
design to `.mockups/konya/<color>/` and a contact sheet per garment to `.mockups/konya-*.jpg`
(`npm run mockups` alone renders every design).

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

Hasret and Sinema designs are separate images in their own folders. They have no long-sleeve
artwork, so the shop does not sell them as a long sleeve (`productTypesFor` in `src/lib/catalog.ts`).
