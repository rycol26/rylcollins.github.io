# Ryan Collins Portfolio Website RC6

RC3 replaces the dark, card-heavy RC2 UI with a restrained engineering/editorial layout.

## Design direction
- Light technical-document aesthetic instead of startup/AI-dashboard styling
- No gradients, glows, giant stat cards, or decorative pill overload
- Compact typography and visible grid lines
- Featured projects use real project evidence as the visual focus
- All other projects use a dense index/list rather than repetitive cards
- Project pages read like engineering case studies
- Public pages show existing evidence, not a large AI-style "evidence roadmap"

## Preview
From the extracted folder:

```powershell
py -m http.server 8000
```

Open http://localhost:8000

## Content
Project data and media from RC2 are preserved under `data/` and `assets/media/`.


## RC4 media update
The supplied rover and UBCO Aerospace media are integrated into their project pages. Rover photographs were orientation-corrected and reframed. Phone screenshots were cropped to the useful project imagery. The two screen-recorded videos were trimmed, cropped to the actual footage, reduced to 30 fps, and transcoded to browser-friendly H.264 MP4.

Three uploaded IMG_4164 files were exact duplicate copies of the same sunset visual, so the site displays that visual once rather than repeating it.

## RC6 cleanup
Removed all resume links and the resume PDF from the site package. Removed the homepage Selected projects / Resume / LinkedIn link row and removed LinkedIn from site data.
