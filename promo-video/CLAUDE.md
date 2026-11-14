# Working on the promo kit

README.md explains how everything is built. This file keeps the rules and the context a new session needs.

## Rules

- **Arabic narration never stops on a vowel** (الوقف لا يكون على متحرك). Every word before a pause
  (، . : ؟ ! and the end of a line) goes to the voice in its pausal form: sukun, ـةٌ → ـهْ, ـًا → ـَا,
  a final shadda without its vowel. `tools/waqf.py` computes it (`pausal`, `to_tts`).
- **On screen, Arabic captions are plain**, except that a word where the voice stops keeps its final haraka
  when that letter carries one (العالمِ، واحدٌ، القرويينَ). The voice drops it; the screen keeps the iʿrab.
  The `show` field of `voice/script.ar.json` holds that text, and the subtitles follow it.
- The Hamed voice (ar-SA-HamedNeural) mishandles some stops. Reword rather than fight it:
  - a stop on the pronoun ـه loses the h (بيدهْ sounds like بيدي): put the pronoun mid-phrase;
  - a stop after a long vowel can lose the length (ضاعْ is heard as ضع): «وما ضاعَ منها»;
  - the pausal وآخرْ loses its خ; the spelling وَءَاخَرْ keeps it;
  - a pausal ـَا after ن sounds like ـة (قرنا heard as قرنة): no stop there.
  `hold` edits in the script lengthen a sound the voice rushes (a madd, a shadda's closure).
- Check every changed Arabic line with `tools/qa_voice.py` before rendering.
- Never let the voice read Quranic verses.
- The author's Arabic name is «إبراهيم حسني إدريسي», as on the site, never «الحسني الإدريسي».
  In English: Ibrahim Hassani Idrissi.
- No music (the subject is the Qur'an), only light synthesized effects; the mix is at −14 LUFS.
- Some plates are not public domain: al-Aqsa, al-Murtada and the Green Qur'an come from
  Dr Mohamed Abdelhafid Khabta, the al-Mansur colophon from Patrimonio Nacional. Keep every image's credit.
- Safe zones for Reels, TikTok and Shorts: the top bar at 190 px, captions from 1272 px to about 1500 px,
  nothing to the right of x ≈ 950 below y ≈ 990. `tools/sheet.sh` draws them over the stills.
- Cue numbers in `scene/content.js` are word indexes in each line's caption: rewording a line can move them.

## Where things are

- GitHub: kmbenjel/masahif-al-maghrib, a fork of hibrh/masahif-al-maghrib. The November 2026 work is on
  `promo-video-social-kit`, built on `claude/hopeful-knuth-uv5orj`.
- The working copy is on the VM hassani-vm, at /home/k/masahif-al-maghrib. The VM has no GitHub
  credentials: push from VS Code's git panel or from the workstation.
- Python: /home/k/.venvs/media (edge-tts, numpy, scipy, soundfile, faster-whisper, torch, transformers).
  Node: `npm install` here installs Playwright 1.64.0; its Chromium is in ~/.cache/ms-playwright.
  Whisper large-v3 and the wav2vec2 phoneme model are in ~/.cache/huggingface.

## Checking

- `tools/qa_voice.py [ids]`: the script's stops, Whisper on each Arabic line, and the last phonemes of each stop.
- `tools/verify_asr.py`: Whisper on the finished videos against the script. It writes numbers as digits
  and wavers between الخطاط and الخطات on the same audio; listen before changing anything for those.
- `tools/sheet.sh <cut>`: a contact sheet with the safe zones.
- `tools/playlist/serve.py`: the four cuts as a playlist in a browser. Over VS Code,
  `"$BROWSER" http://localhost:8765/` opens it on the workstation.
- `tools/build_all.sh <cuts>`: render, mix and encode in one go.
