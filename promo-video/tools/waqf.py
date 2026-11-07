"""Arabic pausal forms (الوقف) for TTS input.

The on-screen text keeps every haraka (the grammatical ending stays visible).
The voice must never stop on a vowel, so each word that precedes a pause
(punctuation or the end of a sentence) is rewritten into its pausal form:

  - tanween damm/kasr, or a final short vowel  ->  sukoon      (أَصِيلٌ -> أَصِيلْ)
  - final shadda+vowel                          ->  shadda only (الْخَطُّ -> الْخَطّ)
  - taa marbuta with any haraka                 ->  haa + sukoon (لَوْحَةً -> لَوْحَهْ)
  - tanween fath on a letter + alif             ->  fatha + alif (جِيلًا -> جِيلَا)
  - tanween fath before alif maqsura            ->  fatha        (مُسْتَوًى -> مُسْتَوَى)
"""
import re

FATHATAN, DAMMATAN, KASRATAN = "ً", "ٌ", "ٍ"
FATHA, DAMMA, KASRA, SHADDA, SUKUN = "َ", "ُ", "ِ", "ّ", "ْ"
SUPERSCRIPT_ALEF = "ٰ"
VOWELS = {FATHATAN, DAMMATAN, KASRATAN, FATHA, DAMMA, KASRA}
MARKS = VOWELS | {SHADDA, SUKUN, SUPERSCRIPT_ALEF}
PAUSE_PUNCT = set("،,.؛;:؟?!…")
TRAIL_PUNCT = set("،,.؛;:؟?!…»\"'”)]")
LEAD_PUNCT = set("«\"'“([")


def split_token(tok):
    i, j = 0, len(tok)
    while i < j and tok[i] in LEAD_PUNCT:
        i += 1
    while j > i and tok[j - 1] in TRAIL_PUNCT:
        j -= 1
    return tok[:i], tok[i:j], tok[j:]


def pausal(word):
    """Return the pausal (موقوف) form of a fully vocalized Arabic word."""
    if not word or not re.search(r"[ء-ي]", word):
        return word
    # tanween fath + alif (written on the letter before the alif): ـًا -> ـَا
    if word.endswith(FATHATAN + "ا"):
        return word[: -2] + FATHA + "ا"
    # tanween fath before alif maqsura: ـًى -> ـَى
    if word.endswith(FATHATAN + "ى"):
        return word[: -2] + FATHA + "ى"
    # strip trailing marks of the last letter
    k = len(word)
    while k > 0 and word[k - 1] in MARKS:
        k -= 1
    base, marks = word[:k], word[k:]
    if not base:
        return word
    last = base[-1]
    if last == "ة":
        return base[:-1] + "ه" + SUKUN
    if last in "اوىي" and not (set(marks) & VOWELS) and SHADDA not in marks:
        return word  # long vowel letter, already silent-ending
    if SHADDA in marks:
        return base + SHADDA  # stop on the doubled consonant
    if SUPERSCRIPT_ALEF in marks:
        return word
    return base + SUKUN


def to_tts(text):
    """Apply pausal forms before every pause and at the end of the text."""
    toks = text.split()
    out = []
    for n, tok in enumerate(toks):
        lead, core, trail = split_token(tok)
        pause_here = n == len(toks) - 1 or any(c in PAUSE_PUNCT for c in trail)
        out.append(lead + (pausal(core) if pause_here else core) + trail)
    return " ".join(out)


def strip_marks(s):
    return "".join(c for c in s if c not in MARKS and c != "ـ")


if __name__ == "__main__":
    import sys
    for line in sys.stdin:
        line = line.strip()
        if line:
            print(to_tts(line))


# ------------------------------------------------------------------ display
# On screen the text is plain, without any mark. The one
# exception is a stop: the voice drops the final haraka there, so the screen
# shows it — only when that last letter really carries a vowel or tanween.
HARAKAT = VOWELS | {SUKUN, SUPERSCRIPT_ALEF}


def plain(word):
    """Strip every mark (harakat, tanween, sukun, shadda, dagger alif)."""
    return "".join(c for c in word if c not in MARKS)


def show_form(word, pause):
    if not pause:
        return plain(word)
    # where are the final letter's marks?  (ـًا and ـًى carry them one letter earlier)
    end = len(word)
    if word.endswith(FATHATAN + "ا") or word.endswith(FATHATAN + "ى"):
        end = len(word) - 1
    k = end
    while k > 0 and word[k - 1] in MARKS:
        k -= 1
    marks = word[k:end]
    if not (set(marks) & VOWELS):  # sakin or long-vowel ending: nothing to show
        return plain(word)
    return plain(word[:k]) + "".join(c for c in marks if c in VOWELS or c == SHADDA) + word[end:]


def to_show(text):
    toks = text.split()
    out = []
    for n, tok in enumerate(toks):
        lead, core, trail = split_token(tok)
        pause_here = n == len(toks) - 1 or any(c in PAUSE_PUNCT for c in trail)
        out.append(lead + show_form(core, pause_here) + trail)
    return " ".join(out)
