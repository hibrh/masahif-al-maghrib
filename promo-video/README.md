# فيديو تعريفي ومواد النشر: مصاحف المغرب

مقاطع عمودية (1080×1920) وصور للتعريف بموقع [masahif-al-maghrib.com](https://masahif-al-maghrib.com/)
في إنستغرام وتيك توك ويوتيوب شورتس وفيسبوك وإكس ولينكدإن وواتساب، بالعربية والإنجليزية.
كل ما يُنشر في `out/`، وفهرسه في [`out/README.md`](out/README.md)، ونصوص النشر الجاهزة في `out/copy/`.

| المادة | العربية | الإنجليزية |
|---|---|---|
| الفيديو الكامل | 78 ثانية | 74 ثانية |
| المقطع القصير: المدخل، ثم اسم الدليل، ثم النفائس، ثم العنوان | 34 ثانية | 34 ثانية |
| نسخة خفيفة (720p) من كل مقطع لواتساب وتلغرام | ✓ | ✓ |
| غلاف لكل مقطع، وكاروسيل من 7 صور (وملف PDF للينكدإن)، وقصة | ✓ | ✓ |
| ترجمة SRT وVTT لكل مقطع | ✓ | ✓ |

## المحتوى

1. **مدخل**: مصحف بخط سلطان المغرب في المسجد الأقصى، وآخر من خزانة المنصور الذهبي في إسبانيا، وثالث في ميونخ.
2. **الكرة الأرضية**: من فاس إلى مكتبات العالم التي تحفظ اليوم مصاحف الدليل، ثم يظهر اسم الموقع.
3. **العصور**: اثنا عشر قرناً، سبعة عصور، أكثر من ستين مصحفاً، على خط زمني بألوان العصور في الموقع نفسه.
4. **نفائس**: ربعتا المرتضى وأبي الحسن بخط يديهما، وخاتمة مصحف المنصور بالذهب على اللازورد، والمصحف الأخضر.
5. **الموقع على الهاتف**: بطاقة مصحف أبي يعقوب يوسف، والعارض المقرِّب، وروابط النسخ المرقمنة (لقطات حقيقية من الموقع).
6. **المُعِدّ**: إبراهيم حسني إدريسي، الخطاط والباحث في المخطوطات، أستاذ الخطوط المغربية بفاس.
7. **الدعوة**: دليل موثق بالعربية والإنجليزية، ثم عنوان الموقع يُكتب حرفاً حرفاً.
8. **الختام**: «تطوير الموقع وإنتاج الفيديو: خالد بن جلون، مطوّر من فاس».

والمقطع القصير يأخذ المدخل والكرة الأرضية والنفائس والعنوان، بختام أقصر.

عنوان الموقع ظاهر أعلى الإطار طوال المقطع، والتعليق الصوتي مكتوب أسفله كلمةً كلمة لمن يشاهد بلا صوت.
والإطار الأول صورة المصحف الأول لا شاشة سوداء، لأن المنصات تعرضه قبل التشغيل.

**مواضع النص**: تضع المنصات أزرارها فوق الفيديو، فرُتّب كل شيء خارجها:
نحو 180 بكسلاً في الأعلى (تبويبات تيك توك وعنوان الريلز)، ونحو 400 في الأسفل (اسم الحساب والوصف)،
وشريط الأزرار في اليمين (الإعجاب والتعليق والمشاركة). فشريط العنوان يبدأ عند 190 بكسلاً، والتعليق المكتوب
ينتهي فوق 1500 بكسل في سطرين متوازنين، وأسماء العصور بعيدة عن الحافة اليمنى.

**الصوت**: صوت «حامد» (ar-SA-HamedNeural) للعربية، و«أندرو» (en-US-AndrewNeural) للإنجليزية، من أصوات مايكروسوفت العصبية.
تحققنا من نطق كل جملة، ومنها عنوان الموقع والأسماء، بتفريغها آلياً (Whisper large-v3) ومقارنتها بالنص.
وليس في المقطع موسيقى، احتراماً لموضوعه؛ وفيه مؤثرات خفيفة مولّدة (انتقالات، ونقرات الكتابة، ورنة خفيفة عند ظهور الاسم).
والصوت مضبوط على ‎-14 LUFS، وهو ما تعتمده المنصات.

## إعادة الإنتاج

كل إطار دالة في الزمن وحده: المشهد صفحة HTML (`scene/`) تُرسم بالزمن `t`، ويلتقطها Chromium إطاراً إطاراً.
والصور الثابتة صفحة أخرى (`posts/`) بالخطوط والألوان نفسها.

```bash
npm install                                                     # Playwright وChromium للرسم
pip install edge-tts numpy scipy soundfile        # والأدوات: ffmpeg وImageMagick، وللفحص faster-whisper وtorch وtransformers
python tools/tts.py ar && python tools/tts.py en               # التعليق الصوتي وتوقيت كل كلمة
for l in ar en; do python tools/build_timeline.py $l; python tools/build_timeline.py $l teaser; done
tools/prep_images.sh                                            # خلفيات مموهة
node tools/capture_ui.js                                        # لقطات الموقع على الهاتف
for c in ar en ar-teaser en-teaser; do
  node tools/render.js $c 8 && python tools/mix.py $c && tools/encode.sh $c
done                                                            # → out/video/
node tools/posts.js                                             # → out/carousel/ وout/covers/ وout/stories/
python tools/subtitles.py                                       # → out/subtitles/
python tools/index.py                                           # → out/README.md، فهرس الملفات
python tools/qa_voice.py                                        # الوقف والنطق في كل جملة عربية
python tools/verify_asr.py                                      # Whisper على الفيديوهات النهائية
tools/sheet.sh ar                                               # لقطات المقطع مع المناطق الآمنة
python3 tools/playlist/serve.py                                 # المقاطع الأربعة قائمةَ تشغيل في المتصفح
```

لتعديل النص: `voice/script.<lang>.json` (الحقل `say` لما يُنطق و`show` لما يُكتب إن اختلفا)،
ثم أعد توليد الصوت والخط الزمني. وفي الملف نفسه `cuts`: الجمل التي يأخذها المقطع القصير، وطول ختامه.
ولا يقف الصوت العربي على متحرك: الكلمة قبل الوقف تُكتب في `say` على صورة الوقف (`tools/waqf.py`)،
وتبقى حركة آخرها في `show` وحده، أي على الشاشة. والقواعد كلها في `CLAUDE.md`.
ونصوص الشاشة والصور ونقاط التزامن في `scene/content.js`، ونصوص الصور الثابتة في `posts/posts.js`.
ولمعاينة لحظة بعينها: `node tools/stills.js ar-teaser 12.5 30` أو افتح `scene/index.html?lang=ar&cut=teaser&play`
على خادم من جذر الموقع، ولمعاينة صورة: `posts/index.html?lang=ar&post=carousel-3`.

## المصادر والتراخيص

- صور المصاحف من الموقع نفسه، ومصادرها مذكورة تحت كل صورة فيه وفي أسفل كل صورة من الكاروسيل. وصورتا خاتمة مصحف المنصور (`assets/`)
  مأخوذتان من عارض IIIF للتراث الوطني الإسباني (Patrimonio Nacional)، الإسكوريال، árabe 1340، الورقة 264و، كما يفعل الموقع.
  وصور ربعة أبي الحسن وربعة المرتضى والمصحف الأخضر منقولة بدقة منخفضة عن د. محمد عبد الحفيظ خبطة، كما في الموقع.
- الخطوط: أميري وIBM Plex Sans Arabic من الموقع، وNoto Kufi Arabic وSource Serif 4 وIBM Plex Sans من @fontsource (رخصة SIL OFL).
- الخريطة: Natural Earth عبر world-atlas (ملك عام / ISC)، والمغرب مرسوم بصحرائه شكلاً واحداً بلا حد داخلي. وd3-geo وtopojson-client (ISC).

---

# Promo video and social media kit: Masahif al-Maghrib

Vertical videos (1080×1920) and images introducing [masahif-al-maghrib.com](https://masahif-al-maghrib.com/),
in Arabic and English, for Reels, TikTok, Shorts, Facebook, X, LinkedIn and WhatsApp. Everything to post is in
`out/`, indexed in [`out/README.md`](out/README.md), with ready-to-paste captions in `out/copy/`.

- **Full cut**: 78 s (Arabic) and 74 s (English).
- **Teaser**: 34 s in each language: the opening, the guide's name, the treasures and the address, with a shorter end card.
- **For each cut**: a light 720p copy for WhatsApp and Telegram, a designed cover, and SRT and VTT captions.
- **Stills**: a 7-image carousel (also as a PDF for LinkedIn) and a story, in each language.

The first frame is the first Qur'an, not black, because platforms show it before playback. The site's address
sits at 190 px, below the TikTok tabs and the Reels title. Captions end above 1500 px, in two balanced lines,
clear of the name and description the apps draw at the bottom. The era labels stay clear of the buttons on the right.

The narration (Microsoft neural voices Hamed and Andrew) was checked line by line with Whisper large-v3,
the URL and the names included. The Arabic voice never stops on a vowel: a word before a pause is spoken
in its pausal form while the caption keeps its final haraka (`tools/waqf.py`, checked with `tools/qa_voice.py`;
the rules are in `CLAUDE.md`). There is no music, out of respect for the subject, only light synthesized
sound effects, and the sound is at -14 LUFS. The commands above rebuild everything: `scene/` is an HTML page
drawn as a pure function of time and captured frame by frame with Chromium, `posts/` draws the stills in the same
look, and `voice/script.<lang>.json` lists the lines each cut keeps under `cuts`. Credits: “Website development
& video production: Khalid Benjelloun, developer from Fez.”
