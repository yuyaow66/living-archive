# Yuyao Wang's Living Archive

A personal archive of research, notes, visual references and project iterations.

[Visit the archive](https://yuyao.design/living-archive/).

## Local preview

Requires Node.js. No dependencies need to be installed.

```sh
npm run dev
```

Open [localhost:5173](http://localhost:5173). Run `npm run check` to check JavaScript syntax.

The site uses plain HTML, CSS and JavaScript. It can be served from the repository root by a static host; `server.mjs` is only needed for local preview.

## Archive content

`data.js` contains 77 real entries: 3 iterations, 3 notes, 6 research entries and 65 references. Prototype 1 contains 26 entries; Prototype 2 contains 51.

New entries use the existing card and detail templates. Keep each internal ID unique and preserve existing IDs. The next available ID is 103. Display numbers are continuous, currently 01–77, and remain the same across searches, filters and sort orders.

Use `prototype` for Prototype 1 or Prototype 2, `category` for research, notes, reference or iterations, and `year` for the archive year. Store publication dates separately. Add real content and accurate image dimensions, descriptions, credits and source links where available.

## Homesick Here photographs

All 49 photographs recorded for *Homesick Here* are archived under Prototype 2: 48 used in the current book and one from an earlier colophon. Three existing Cui Cui entries are reused; 46 new photographs have been added. Search for `Homesick Here`, a book section, photographer or source filename to find them. Photo details show titles, photographer credits and source links without descriptions.

Original image files and thumbnails are stored in `assets/book-photos`; the three existing high-resolution Cui Cui originals remain in `assets/prototype-2`. Full source records, credits, source URLs, original filenames, SHA-256 hashes and archive entry IDs are preserved in `assets/book-photos/sources.json`. Page numbers in that provenance file come from the original manifest and may refer to earlier layouts.

## Book iterations

Two *Homesick Here* layouts are filed under Prototype 2 → iterations: **Iteration 1: Homesick Here** (original layout) and **Iteration 2: Homesick Here** (Zine Layout v2). Each includes all 33 spreads and its complete 64-page PDF. The saved exports are from 26 and 28 October 2026 respectively. Preview images preserve the exported page layouts; both entry previews show pages 28–29 for comparison.

## Credits and font files

The site uses PP Neue Montreal Mono supplied by the site owner, who has confirmed authorization for its public distribution in this project. The accompanying EULA is retained in `assets/fonts`. Inclusion here does not grant visitors permission to reuse the font files. [Pangram Pangram FAQ](https://pangrampangram.com/pages/faq) · [EULA](https://pangrampangram.com/pages/eula).

Photography, artwork, paper previews and reference-site screenshots retain their original authors' rights. Inclusion in this archive does not grant a license to reuse them. Source and author information is preserved in the relevant entries.

Selected sources: [A Shape of Her](https://yuyao.design/a-shape-of-her/), [Iteration I](https://yuyaowthesisarchive.cargo.site/iteration-i), [Rinko Kawauchi — Cui Cui](https://rinkokawauchi.com/en/works/213/). Research entries retain their original article and DOI links.

Layout references: [Cereal](https://www.readcereal.com/) and [Studio Faculty](https://www.studiofaculty.com/work/cereal-website).
