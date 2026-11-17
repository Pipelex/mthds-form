# The camera: photographing a document or an image

On a phone, the person filling a form often holds the document on paper rather than as a file. The file control therefore offers a camera: on a touch screen, an empty document or image input shows **Take photo** under its dropzone, which opens the device's back camera. A document is photographed page by page into one PDF, and an image input keeps one photo as a JPEG. The file the camera makes is stored through the control's own upload path, exactly as a dropped file is, so the value the form holds and sends is an ordinary file value, and the runner never learns that a camera made it.

This page is the feature and the rules that bind it. What a host owes the file control in general is [upload-seam.md](upload-seam.md); the seam the camera adds to it, `onPreparingFile`, is described there too.

## When the camera is offered

All three conditions must hold:

- **The host uploads.** The camera is offered only when the host supplies `onDropFile`, because the photographed file is stored through that one path. A host offering links alone, or a team file source alone, gets no camera.
- **The input takes photos.** The core's `takesPhotos(field)` holds for a document input that accepts PDF and for an image input that accepts JPEG, the two files a camera can make. It reads the field's `formats`, so an input a host narrowed with `narrowFileFormats` to formats excluding those gets no camera ([upload-seam.md](upload-seam.md#what-a-slot-accepts-is-one-list-and-a-host-narrows-it-once)).
- **The screen is a touch screen.** "Take photo" is in the page on every device and drawn only under the media query `(hover: none)`, through Tailwind's arbitrary variant `[@media(hover:none)]:flex`. A computer's browser ignores `capture`, so the button would open a mere picture picker there; on a touch screen the dropzone's own tap opens the operating system's picker, which offers files and the photo library, and "Take photo" goes straight to the camera. The decision is CSS rather than script, so the server's markup and the browser's agree and nothing moves after hydration.

A list of documents or images gets the camera through its rows, each a file control of its own, and never through its drop area for several files, which takes files the person already has.

## What the person sees

- **Take photo**, under the empty dropzone and above the team files' entry when there is one, full width and 48 pixels tall.
- **The page strip**, in place of the dropzone, once a photo is taken: numbered thumbnails, 64 by 88 pixels and 8 apart, in the order they were taken, wrapping onto more rows rather than scrolling sideways, then a dashed **Add page** tile for a document. An image input's strip holds its one photo, unnumbered, with no Add page. Tapping a page opens a menu with **Retake**, which replaces the page in place, and **Remove**. There is no reordering: Retake fixes a bad page without moving it.
- **A page being read** is a tile with a spinner after the pages, and a retake spins over the page it replaces; Add page waits until the reading is over.
- **The chip**, under the strip, once the file is stored: "Purchase order · 3 pages" for a document, "Picture · photo" for an image, with the button that empties the input, pages and all.
- **A refusal**, in the control's alert slot, when a photo cannot be read or its file cannot be made.

## How a photo becomes a file

**Reading a photo makes its page once** (`src/react/photo-reading.ts`). The photo is decoded once with `createImageBitmap(photo, { imageOrientation: 'from-image' })`, so a phone's portrait photo stored landscape with an EXIF rotate tag comes out upright; a browser that refuses that option decodes with its default instead. From that one bitmap come the page, its long edge bounded to `MAX_PAGE_EDGE` (2048 pixels, never scaled up), encoded as a JPEG at `JPEG_QUALITY` (0.85) on white, and the thumbnail, bounded to `THUMBNAIL_EDGE` (320 pixels). The photo itself is dropped. The full-size bitmap is closed before any canvas is made and every canvas is shrunk to 0×0 after use, because a phone's browser holds little memory for canvases. Photos are read one at a time, in the order they were taken.

**The PDF only assembles the pages** (`src/react/photos-pdf.ts`). It loads `jspdf` through `import()` (never a static import, [dependency-budget.md](dependency-budget.md)), prefetched on a document input's first photo, and places each page's JPEG as it is, with no second encoding, on a page whose long edge is `PAGE_LONG_EDGE_PT` (842 points, A4's) in the photo's own shape, so a landscape photo is a landscape page. The PDF's title is the input's label. An image input's file is its page's JPEG itself.

**The file is named after the input's label**: `Purchase order.pdf`, `Picture.jpg`. The rule (`src/core/photo-file.ts`) removes the characters a file system refuses, collapses spaces, and falls back to "Photo" for a label left with nothing, as a list row's is.

## When the file is stored

**Whenever the pages settle.** Every change to the pages, a photo taken, a retake or a removal, makes the file again once no photo is still being read, and hands it to the control's upload path. A newer set of pages supersedes the upload of an older one: the form drops the older answer, as it does for any second drop at the same id. Removing the last page empties the value.

**A file being made counts as an upload in flight.** From the photo to the hand-off the file control reports it is preparing a file through `FieldEnv.onPreparingFile(id, true)`, then `false`; `MethodForm` keeps those ids in `preparingIds`, and its `uploading`, `ready` and `touched` count them, so a run cannot start on a value about to change ([method-form.md](method-form.md)). A host that does not supply the seam gets the stricter fallback: the field writes its value empty the moment its pages change, so a run started meanwhile sends no stale file ([upload-seam.md](upload-seam.md#a-file-being-made-is-an-upload-in-flight)).

**The stored file is the truth; the pages are an editing aid.** The control keeps the pages only while the value is the file they made, or its upload is still in flight. Any other value discards them, whoever wrote it: a file dropped or linked, a team file, an example, a reset, a host's own write. A failed upload discards them too, leaving the value as it was. The pages are not saved anywhere; a reload shows the stored file's chip without them.

## Refusals

A photo that cannot be read, because the browser cannot decode it or its canvas gives no image back, is refused at once (`photoUndecodable`: "This photo's format can't be used here…"), and the pages already held, and the file they made, stand. Pages whose file cannot be made are refused with `photoNotKept` ("This photo couldn't be kept. Take it again or remove it."), and the field's value is emptied. Neither refusal has a Dismiss and neither blocks the form: the next action on the input clears it.

## Words

The camera's copy is `FieldStrings` keys like any other, in English and French: `takePhoto`, `takePhotoAria`, `addPage`, `photoPage`, `photoImage`, `retakePhoto`, `removePhoto`, `readingPhoto`, `photoUndecodable`, `photoNotKept`, `photoPagesChip` and `photoChip` ([i18n.md](i18n.md)).

## Where it is tested

`src/core/__tests__/photo-file.test.ts` pins `takesPhotos` and the file name. `src/react/__tests__/camera.test.tsx` pins the control in jsdom, with the reading and the PDF mocked: where the camera is offered, the pages and their menu, storing and superseding, the seam and its fallback, the discards and the refusals, and the controller's `preparingIds`. The real decode, the bounds, the JPEG and the PDF's pages and title are checked in Chromium by `Inputs/Camera/Photo reading`, and the control's states by `Inputs/Camera`, whose touch-screen story reads the `(hover: none)` rule from the style sheet and applies it to measure "Take photo", since no story can make the browser a touch screen without reaching the stories beside it (`touchScreenRules` in `src/__stories__/touch-target.ts`).
