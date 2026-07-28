/* Time-of-day greetings across a broad set of world languages. Kept local,
   same reasoning as facts.js/namedays.js — no external translation API, no
   network dependency. These are standard phrasebook-level greetings, not
   machine translated, and lean on a general-purpose greeting where a
   language doesn't distinguish morning/afternoon/evening/night. This is a
   broad sample, not an exhaustive list of the world's ~7,000 languages. */

window.GREETING_LANGUAGES = [
  { english: 'French', native: 'Français', morning: 'Bonjour', afternoon: 'Bonjour', evening: 'Bonsoir', night: 'Bonne nuit' },
  { english: 'Spanish', native: 'Español', morning: 'Buenos días', afternoon: 'Buenas tardes', evening: 'Buenas tardes', night: 'Buenas noches' },
  { english: 'German', native: 'Deutsch', morning: 'Guten Morgen', afternoon: 'Guten Tag', evening: 'Guten Abend', night: 'Gute Nacht' },
  { english: 'Italian', native: 'Italiano', morning: 'Buongiorno', afternoon: 'Buongiorno', evening: 'Buonasera', night: 'Buonanotte' },
  { english: 'Portuguese', native: 'Português', morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa noite', night: 'Boa noite' },
  { english: 'Dutch', native: 'Nederlands', morning: 'Goedemorgen', afternoon: 'Goedemiddag', evening: 'Goedenavond', night: 'Goedenacht' },
  { english: 'Swedish', native: 'Svenska', morning: 'God morgon', afternoon: 'God eftermiddag', evening: 'God kväll', night: 'God natt' },
  { english: 'Norwegian', native: 'Norsk', morning: 'God morgen', afternoon: 'God ettermiddag', evening: 'God kveld', night: 'God natt' },
  { english: 'Danish', native: 'Dansk', morning: 'God morgen', afternoon: 'God eftermiddag', evening: 'God aften', night: 'God nat' },
  { english: 'Finnish', native: 'Suomi', morning: 'Hyvää huomenta', afternoon: 'Hyvää päivää', evening: 'Hyvää iltaa', night: 'Hyvää yötä' },
  { english: 'Polish', native: 'Polski', morning: 'Dzień dobry', afternoon: 'Dzień dobry', evening: 'Dobry wieczór', night: 'Dobranoc' },
  { english: 'Czech', native: 'Čeština', morning: 'Dobré ráno', afternoon: 'Dobrý den', evening: 'Dobrý večer', night: 'Dobrou noc' },
  { english: 'Slovak', native: 'Slovenčina', morning: 'Dobré ráno', afternoon: 'Dobrý deň', evening: 'Dobrý večer', night: 'Dobrú noc' },
  { english: 'Slovenian', native: 'Slovenščina', morning: 'Dobro jutro', afternoon: 'Dober dan', evening: 'Dober večer', night: 'Lahko noč' },
  { english: 'Bulgarian', native: 'Български', morning: 'Добро утро', afternoon: 'Добър ден', evening: 'Добър вечер', night: 'Лека нощ' },
  { english: 'Serbian', native: 'Српски', morning: 'Добро јутро', afternoon: 'Добар дан', evening: 'Добро вече', night: 'Лаку ноћ' },
  { english: 'Croatian', native: 'Hrvatski', morning: 'Dobro jutro', afternoon: 'Dobar dan', evening: 'Dobra večer', night: 'Laku noć' },
  { english: 'Bosnian', native: 'Bosanski', morning: 'Dobro jutro', afternoon: 'Dobar dan', evening: 'Dobra večer', night: 'Laku noć' },
  { english: 'Macedonian', native: 'Македонски', morning: 'Добро утро', afternoon: 'Добар ден', evening: 'Добро вечер', night: 'Добра ноќ' },
  { english: 'Lithuanian', native: 'Lietuvių', morning: 'Labas rytas', afternoon: 'Laba diena', evening: 'Labas vakaras', night: 'Labanakt' },
  { english: 'Latvian', native: 'Latviešu', morning: 'Labrīt', afternoon: 'Labdien', evening: 'Labvakar', night: 'Ar labu nakti' },
  { english: 'Estonian', native: 'Eesti', morning: 'Tere hommikust', afternoon: 'Tere päevast', evening: 'Tere õhtust', night: 'Head ööd' },
  { english: 'Albanian', native: 'Shqip', morning: 'Mirëmëngjes', afternoon: 'Mirëdita', evening: 'Mirëmbrëma', night: 'Natën e mirë' },
  { english: 'Greek', native: 'Ελληνικά', morning: 'Καλημέρα', afternoon: 'Καλημέρα', evening: 'Καλησπέρα', night: 'Καληνύχτα' },
  { english: 'Maltese', native: 'Malti', morning: 'Bonġu', afternoon: 'Bonġu', evening: 'Bonswa', night: 'Il-lejl it-tajjeb' },
  { english: 'Basque', native: 'Euskara', morning: 'Egun on', afternoon: 'Arratsalde on', evening: 'Arratsalde on', night: 'Gabon' },
  { english: 'Galician', native: 'Galego', morning: 'Bos días', afternoon: 'Boas tardes', evening: 'Boas tardes', night: 'Boas noites' },
  { english: 'Catalan', native: 'Català', morning: 'Bon dia', afternoon: 'Bona tarda', evening: 'Bon vespre', night: 'Bona nit' },
  { english: 'Luxembourgish', native: 'Lëtzebuergesch', morning: 'Gudde Moien', afternoon: 'Gudde Mëtteg', evening: 'Gudden Owend', night: 'Gutt Nuecht' },
  { english: 'Corsican', native: 'Corsu', morning: 'Bongiornu', afternoon: 'Bongiornu', evening: 'Bona sera', night: 'Bona notte' },
  { english: 'Icelandic', native: 'Íslenska', morning: 'Góðan daginn', afternoon: 'Góðan daginn', evening: 'Gott kvöld', night: 'Góða nótt' },
  { english: 'Welsh', native: 'Cymraeg', morning: 'Bore da', afternoon: 'Prynhawn da', evening: 'Noswaith dda', night: 'Nos da' },
  { english: 'Irish', native: 'Gaeilge', morning: 'Maidin mhaith', afternoon: 'Tráthnóna maith', evening: 'Tráthnóna maith', night: 'Oíche mhaith' },
  { english: 'Romanian', native: 'Română', morning: 'Bună dimineața', afternoon: 'Bună ziua', evening: 'Bună seara', night: 'Noapte bună' },
  { english: 'Hungarian', native: 'Magyar', morning: 'Jó reggelt', afternoon: 'Jó napot', evening: 'Jó estét', night: 'Jó éjszakát' },
  { english: 'Russian', native: 'Русский', morning: 'Доброе утро', afternoon: 'Добрый день', evening: 'Добрый вечер', night: 'Спокойной ночи' },
  { english: 'Ukrainian', native: 'Українська', morning: 'Добрий ранок', afternoon: 'Добрий день', evening: 'Добрий вечір', night: 'Надобраніч' },
  { english: 'Georgian', native: 'ქართული', morning: 'დილა მშვიდობისა', afternoon: 'გამარჯობა', evening: 'საღამო მშვიდობისა', night: 'ღამე მშვიდობისა' },
  { english: 'Armenian', native: 'Հայերեն', morning: 'Բարի լույս', afternoon: 'Բարև ձեզ', evening: 'Բարի երեկո', night: 'Բարի գիշեր' },
  { english: 'Turkish', native: 'Türkçe', morning: 'Günaydın', afternoon: 'İyi günler', evening: 'İyi akşamlar', night: 'İyi geceler' },
  { english: 'Yiddish', native: 'ייִדיש', morning: 'אַ גוטן מאָרגן', afternoon: 'אַ גוטן טאָג', evening: 'אַ גוטן אָוונט', night: 'אַ גוטע נאַכט' },
  { english: 'Hebrew', native: 'עברית', morning: 'בוקר טוב', afternoon: 'צהריים טובים', evening: 'ערב טוב', night: 'לילה טוב' },
  { english: 'Arabic', native: 'العربية', morning: 'صباح الخير', afternoon: 'مساء الخير', evening: 'مساء الخير', night: 'تصبح على خير' },
  { english: 'Persian', native: 'فارسی', morning: 'صبح بخیر', afternoon: 'روز بخیر', evening: 'عصر بخیر', night: 'شب بخیر' },
  { english: 'Urdu', native: 'اردو', morning: 'صبح بخیر', afternoon: 'السلام علیکم', evening: 'شام بخیر', night: 'شب بخیر' },
  { english: 'Hindi', native: 'हिन्दी', morning: 'सुप्रभात', afternoon: 'नमस्ते', evening: 'शुभ संध्या', night: 'शुभ रात्रि' },
  { english: 'Bengali', native: 'বাংলা', morning: 'শুভ সকাল', afternoon: 'শুভ অপরাহ্ন', evening: 'শুভ সন্ধ্যা', night: 'শুভ রাত্রি' },
  { english: 'Punjabi', native: 'ਪੰਜਾਬੀ', morning: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', afternoon: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', evening: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', night: 'ਸ਼ੁਭ ਰਾਤ੍ਰੀ' },
  { english: 'Gujarati', native: 'ગુજરાતી', morning: 'શુભ સવાર', afternoon: 'નમસ્તે', evening: 'શુભ સાંજ', night: 'શુભ રાત્રિ' },
  { english: 'Marathi', native: 'मराठी', morning: 'शुभ प्रभात', afternoon: 'नमस्कार', evening: 'शुभ संध्याकाळ', night: 'शुभ रात्री' },
  { english: 'Tamil', native: 'தமிழ்', morning: 'காலை வணக்கம்', afternoon: 'மதிய வணக்கம்', evening: 'மாலை வணக்கம்', night: 'இரவு வணக்கம்' },
  { english: 'Telugu', native: 'తెలుగు', morning: 'శుభోదయం', afternoon: 'శుభ మధ్యాహ్నం', evening: 'శుభ సాయంత్రం', night: 'శుభ రాత్రి' },
  { english: 'Kannada', native: 'ಕನ್ನಡ', morning: 'ಶುಭೋದಯ', afternoon: 'ನಮಸ್ಕಾರ', evening: 'ಶುಭ ಸಂಜೆ', night: 'ಶುಭ ರಾತ್ರಿ' },
  { english: 'Malayalam', native: 'മലയാളം', morning: 'സുപ്രഭാതം', afternoon: 'നമസ്കാരം', evening: 'ശുഭ സന്ധ്യ', night: 'ശുഭ രാത്രി' },
  { english: 'Nepali', native: 'नेपाली', morning: 'नमस्ते', afternoon: 'नमस्ते', evening: 'नमस्ते', night: 'शुभ रात्री' },
  { english: 'Sinhala', native: 'සිංහල', morning: 'සුභ උදෑසනක්', afternoon: 'සුභ දහවලක්', evening: 'සුභ සන්ධ්‍යාවක්', night: 'සුභ රාත්‍රියක්' },
  { english: 'Japanese', native: '日本語', morning: 'おはようございます', afternoon: 'こんにちは', evening: 'こんばんは', night: 'おやすみなさい' },
  { english: 'Korean', native: '한국어', morning: '좋은 아침이에요', afternoon: '안녕하세요', evening: '좋은 저녁이에요', night: '안녕히 주무세요' },
  { english: 'Mandarin Chinese', native: '中文', morning: '早上好', afternoon: '下午好', evening: '晚上好', night: '晚安' },
  { english: 'Mongolian', native: 'Монгол', morning: 'Өглөөний мэнд', afternoon: 'Өдрийн мэнд', evening: 'Оройн мэнд', night: 'Сайхан амраарай' },
  { english: 'Kazakh', native: 'Қазақша', morning: 'Сәлеметсіз бе', afternoon: 'Сәлеметсіз бе', evening: 'Сәлеметсіз бе', night: 'Қайырлы түн' },
  { english: 'Uzbek', native: 'Oʻzbekcha', morning: 'Xayrli tong', afternoon: 'Xayrli kun', evening: 'Xayrli kech', night: 'Xayrli tun' },
  { english: 'Burmese', native: 'မြန်မာ', morning: 'မင်္ဂလာပါ', afternoon: 'မင်္ဂလာပါ', evening: 'မင်္ဂလာပါ', night: 'မင်္ဂလာပါ' },
  { english: 'Khmer', native: 'ខ្មែរ', morning: 'អរុណសួស្តី', afternoon: 'សួស្តី', evening: 'សួស្តី', night: 'រាត្រីសួស្តី' },
  { english: 'Lao', native: 'ລາວ', morning: 'ສະບາຍດີ', afternoon: 'ສະບາຍດີ', evening: 'ສະບາຍດີ', night: 'ສະບາຍດີ' },
  { english: 'Thai', native: 'ภาษาไทย', morning: 'อรุณสวัสดิ์', afternoon: 'สวัสดี', evening: 'สวัสดีตอนเย็น', night: 'ราตรีสวัสดิ์' },
  { english: 'Vietnamese', native: 'Tiếng Việt', morning: 'Chào buổi sáng', afternoon: 'Chào buổi chiều', evening: 'Chào buổi tối', night: 'Chúc ngủ ngon' },
  { english: 'Indonesian', native: 'Bahasa Indonesia', morning: 'Selamat pagi', afternoon: 'Selamat siang', evening: 'Selamat malam', night: 'Selamat malam' },
  { english: 'Malay', native: 'Bahasa Melayu', morning: 'Selamat pagi', afternoon: 'Selamat tengah hari', evening: 'Selamat petang', night: 'Selamat malam' },
  { english: 'Filipino', native: 'Tagalog', morning: 'Magandang umaga', afternoon: 'Magandang hapon', evening: 'Magandang gabi', night: 'Magandang gabi' },
  { english: 'Swahili', native: 'Kiswahili', morning: 'Habari za asubuhi', afternoon: 'Habari za mchana', evening: 'Habari za jioni', night: 'Usiku mwema' },
  { english: 'Amharic', native: 'አማርኛ', morning: 'ሰላም', afternoon: 'ሰላም', evening: 'ሰላም', night: 'መልካም ሌሊት' },
  { english: 'Somali', native: 'Soomaali', morning: 'Subax wanaagsan', afternoon: 'Galab wanaagsan', evening: 'Fiid wanaagsan', night: 'Habeen wanaagsan' },
  { english: 'Hausa', native: 'Hausa', morning: 'Barka da safiya', afternoon: 'Barka da rana', evening: 'Barka da yamma', night: 'Barka da dare' },
  { english: 'Yoruba', native: 'Yorùbá', morning: 'Ẹ kú àárọ̀', afternoon: 'Ẹ kú ọ̀sán', evening: 'Ẹ kú alẹ́', night: 'Ẹ kú alẹ́' },
  { english: 'Igbo', native: 'Igbo', morning: 'Ụtụtụ ọma', afternoon: 'Ehihie ọma', evening: 'Mgbede ọma', night: 'Ka chi fo' },
  { english: 'Zulu', native: 'isiZulu', morning: 'Sawubona ekuseni', afternoon: 'Sawubona emini', evening: 'Sawubona kusihlwa', night: 'Lala kahle' },
  { english: 'Xhosa', native: 'isiXhosa', morning: 'Molo', afternoon: 'Molo', evening: 'Molo', night: 'Lala kakuhle' },
  { english: 'Afrikaans', native: 'Afrikaans', morning: 'Goeie môre', afternoon: 'Goeie middag', evening: 'Goeie naand', night: 'Goeie nag' },
  { english: 'Malagasy', native: 'Malagasy', morning: 'Manao ahoana', afternoon: 'Manao ahoana', evening: 'Manao ahoana', night: 'Tsara mandry' },
  { english: 'Hawaiian', native: 'ʻŌlelo Hawaiʻi', morning: 'Aloha kakahiaka', afternoon: 'Aloha ʻauinalā', evening: 'Aloha ahiahi', night: 'Pō maikaʻi' },
  { english: 'Māori', native: 'Te Reo Māori', morning: 'Mōrena', afternoon: 'Kia ora', evening: 'Ahiahi mārie', night: 'Pō mārie' },
  { english: 'Samoan', native: 'Gagana Sāmoa', morning: 'Talofa', afternoon: 'Talofa', evening: 'Talofa', night: 'Manuia le pō' },
  { english: 'Tongan', native: 'Lea Fakatonga', morning: 'Mālō e lelei', afternoon: 'Mālō e lelei', evening: 'Mālō e lelei', night: 'Mālō e lelei' },
  { english: 'Fijian', native: 'Na Vosa Vakaviti', morning: 'Bula', afternoon: 'Bula', evening: 'Bula', night: 'Moce' },
  { english: 'Esperanto', native: 'Esperanto', morning: 'Bonan matenon', afternoon: 'Bonan posttagmezon', evening: 'Bonan vesperon', night: 'Bonan nokton' },
  { english: 'Latin', native: 'Latina', morning: 'Salve', afternoon: 'Salve', evening: 'Salve', night: 'Bona nox' }
];

/* A handful of pop-culture fictional/constructed languages, for fun. These
   don't have documented time-of-day greeting forms, so the same phrase is
   used for every bucket, with its real in-universe meaning as the
   "translation" rather than a literal "Good morning". Kept as a small,
   occasional surprise mixed into the same random pool. */

window.GREETING_LANGUAGES = window.GREETING_LANGUAGES.concat([
  {
    english: 'Klingon (Star Trek)', native: 'tlhIngan Hol',
    morning: 'nuqneH', afternoon: 'nuqneH', evening: 'nuqneH', night: 'nuqneH',
    translations: { morning: 'Hello (literally "what do you want?")', afternoon: 'Hello (literally "what do you want?")', evening: 'Hello (literally "what do you want?")', night: 'Hello (literally "what do you want?")' }
  },
  {
    english: 'Sindarin Elvish (Lord of the Rings)', native: 'Edhellen',
    morning: 'Mae govannen', afternoon: 'Mae govannen', evening: 'Mae govannen', night: 'Mae govannen',
    translations: { morning: 'Well met', afternoon: 'Well met', evening: 'Well met', night: 'Well met' }
  },
  {
    english: "Na'vi (Avatar)", native: "Na'vi",
    morning: 'Kaltxì', afternoon: 'Kaltxì', evening: 'Kaltxì', night: 'Kaltxì',
    translations: { morning: 'Hello', afternoon: 'Hello', evening: 'Hello', night: 'Hello' }
  },
  {
    english: 'Dothraki (Game of Thrones)', native: 'Lekh Dothraki',
    morning: "M'athchomaroon", afternoon: "M'athchomaroon", evening: "M'athchomaroon", night: "M'athchomaroon",
    translations: { morning: 'I honor you', afternoon: 'I honor you', evening: 'I honor you', night: 'I honor you' }
  },
  {
    english: 'Simlish (The Sims)', native: 'Simlish',
    morning: 'Sul sul!', afternoon: 'Sul sul!', evening: 'Sul sul!', night: 'Sul sul!',
    translations: { morning: 'Hello!', afternoon: 'Hello!', evening: 'Hello!', night: 'Hello!' }
  },
  {
    english: 'Minionese (Despicable Me)', native: 'Minionese',
    morning: 'Bello!', afternoon: 'Bello!', evening: 'Bello!', night: 'Bello!',
    translations: { morning: 'Hello! (Minionese is mostly playful gibberish, not a real structured language)', afternoon: 'Hello! (Minionese is mostly playful gibberish, not a real structured language)', evening: 'Hello! (Minionese is mostly playful gibberish, not a real structured language)', night: 'Hello! (Minionese is mostly playful gibberish, not a real structured language)' }
  }
]);
