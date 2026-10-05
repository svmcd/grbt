# Shirt designs

The Memleket product images on the site are generated. You never make a mockup by hand:
drop the artwork of a design in a folder and every product image is built from the
templates: T-shirt, hoodie and sweater, black and white, front and back (12 images).

```
designs/
  templates/
    logo.svg                 chest logo, printed on every garment
    tshirt-{front,back}-{black,white}.svg     blank T-shirts
    hoodie-{front,back}-{black,white}.png     blank hoodies
    sweater-{front,back}-{black,white}.png    blank sweaters
  memleket/
    <slug>/                  one folder per design, e.g. konya, sanliurfa
      photo.jpg              the photo inside the frame on the back
      name.svg  (or .png)    the city name under the photo
      plate.svg (or .png)    the plate number on the left sleeve
```

Output in `public/products/collections/memleket/<slug>/{siyah,beyaz}/`: `front.png`,
`back.png` (T-shirt), `hoodie_front.png`, `hoodie_back.png`, `sweater_front.png`,
`sweater_back.png`.
These files are not in git; they are rebuilt automatically by `npm run dev` and
`npm run build` (also on Vercel). Run `npm run mockups` to rebuild by hand, or
`npm run mockups -- --force` to rebuild everything.

## Adding a new design

1. In Figma, export three layers of the design:
   - the photo layer (portrait, about 660 x 776) as `photo.jpg` or `photo.png`
   - the city name layer as `name.svg`
   - the sleeve number layer as `plate.svg`
   Color does not matter: logo, name and number are printed white on black garments and
   black on white garments automatically. The frame around the photo is drawn by the
   generator. The same artwork is scaled onto the hoodie and sweater, and the sleeve number
   is turned to the sleeve angle.
2. Put them in `designs/memleket/<slug>/`. The slug is the URL name: lowercase, no Turkish
   characters (`sanliurfa`, `kahramanmaras`).
3. Add the product text: the slug to `memleketSlugs` and its description in
   `src/lib/catalog.ts` (Turkish), plus `src/i18n/catalog/en.ts`, `de.ts`, `fr.ts`.
4. Run `npm run dev` and check `/product/<slug>`.

## Changing the shirt

- New logo: replace `templates/logo.svg`, then `npm run mockups -- --force`. Every
  garment of every design gets it.
- Moving the print: the positions are at the top of `scripts/generate-mockups.mjs`
  (`PRINT`, `PLATE` for the T-shirt; `GARMENTS` for where it goes on hoodie and sweater).

Hasret and Sinema designs are separate images in their own folders.
