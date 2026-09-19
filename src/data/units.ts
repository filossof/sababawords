/**
 * Course content. One spec per unit, shared by the English and Arabic courses so both stay aligned:
 *   words:     hebrew | english | arabic | arabic transliteration (Hebrew letters) | picture (emoji, optional)
 *   sentences: hebrew | english | arabic
 * Each unit has 12 words and 6 sentences (see levels.ts for how they become 8 levels).
 */
export interface UnitSpec {
  id: string
  title: string
  emoji: string
  /** theme colour for the unit's banner, path and lesson screens */
  color: string
  words: string
  sentences: string
}

export const UNIT_SPECS: UnitSpec[] = [
  {
    id: 'basics',
    title: 'יסודות',
    emoji: '👋',
    color: '#58cc02',
    words: `
שלום|hello|مرحبا|מרחבא|👋
להתראות|goodbye|مع السلامة|מעא סלאמה|🚪
תודה|thank you|شكرا|שוכראן|🙏
בבקשה|please|من فضلك|מין פצלך|🥺
כן|yes|نعم|נעם|✅
לא|no|لا|לא|❌
בוקר טוב|good morning|صباح الخير|סבאח אלח'יר|🌅
לילה טוב|good night|تصبح على خير|תצבח עלא ח'יר|🌙
מצטער|sorry|آسف|אסף|😔
סליחה|excuse me|لو سمحت|לו סמחת|🙋
ברוכים הבאים|welcome|أهلا وسهلا|אהלן וסהלן|🎉
מה שלומך?|how are you?|كيف حالك؟|כיף חאלך|🤔`,
    sentences: `
שמי דן.|My name is Dan.|اسمي دان.
מה שמך?|What is your name?|ما اسمك؟
נעים להכיר.|Nice to meet you.|تشرفت بمعرفتك.
אני בסדר, תודה.|I am fine, thank you.|أنا بخير، شكرا.
בוקר טוב לכולם.|Good morning, everyone.|صباح الخير للجميع.
להתראות מחר.|See you tomorrow.|أراك غدا.`,
  },
  {
    id: 'numbers',
    title: 'מספרים',
    emoji: '🔢',
    color: '#1cb0f6',
    words: `
אחד|one|واحد|ואחד|1️⃣
שניים|two|اثنان|אתנאן|2️⃣
שלושה|three|ثلاثة|תלאתה|3️⃣
ארבעה|four|أربعة|ארבעה|4️⃣
חמישה|five|خمسة|חמסה|5️⃣
שישה|six|ستة|סתה|6️⃣
שבעה|seven|سبعة|סבעה|7️⃣
שמונה|eight|ثمانية|תמאניה|8️⃣
תשעה|nine|تسعة|תסעה|9️⃣
עשרה|ten|عشرة|עשרה|🔟
מאה|hundred|مئة|מיאה|💯
אפס|zero|صفر|צפר|0️⃣`,
    sentences: `
יש לי שני אחים.|I have two brothers.|عندي أخوان.
אני בן עשר.|I am ten years old.|عمري عشر سنوات.
יש חמישה ספרים על השולחן.|There are five books on the table.|هناك خمسة كتب على الطاولة.
אני רואה שלושה כלבים.|I see three dogs.|أرى ثلاثة كلاب.
כמה זה עולה?|How much is this?|كم سعر هذا؟
יש לנו שבעה ימים בשבוע.|We have seven days in a week.|عندنا سبعة أيام في الأسبوع.`,
  },
  {
    id: 'colors',
    title: 'צבעים',
    emoji: '🎨',
    color: '#ff86d0',
    words: `
אדום|red|أحمر|אחמר|🔴
כחול|blue|أزرق|אזרק|🔵
ירוק|green|أخضر|אח'צר|🟢
צהוב|yellow|أصفر|אצפר|🟡
לבן|white|أبيض|אבייץ'|⚪
שחור|black|أسود|אסוד|⚫
כתום|orange|برتقالي|ברתקאלי|🟠
סגול|purple|بنفسجي|בנפסג'י|🟣
חום|brown|بني|בני|🟤
ורוד|pink|وردي|ורדי|🌸
אפור|gray|رمادي|רמאדי|🩶
זהב|gold|ذهبي|דהבי|🥇`,
    sentences: `
השמים כחולים.|The sky is blue.|السماء زرقاء.
התפוח אדום.|The apple is red.|التفاحة حمراء.
אני אוהב את הצבע הירוק.|I like the color green.|أحب اللون الأخضر.
לחתול שלי יש פרווה שחורה.|My cat has black fur.|لقطتي فرو أسود.
השמש צהובה.|The sun is yellow.|الشمس صفراء.
איזה צבע זה?|What color is this?|ما لون هذا؟`,
  },
  {
    id: 'animals',
    title: 'חיות',
    emoji: '🐶',
    color: '#ff9600',
    words: `
כלב|dog|كلب|כלב|🐶
חתול|cat|قط|קט|🐱
ציפור|bird|طائر|טאאר|🐦
דג|fish|سمكة|סמכה|🐟
סוס|horse|حصان|חצאן|🐴
פרה|cow|بقرة|בקרה|🐄
ארנב|rabbit|أرنب|ארנב|🐰
פיל|elephant|فيل|פיל|🐘
אריה|lion|أسد|אסד|🦁
קוף|monkey|قرد|קרד|🐵
דוב|bear|دب|דב|🐻
ברווז|duck|بطة|בטה|🦆`,
    sentences: `
הכלב רץ בגינה.|The dog runs in the garden.|الكلب يركض في الحديقة.
החתול ישן על הספה.|The cat sleeps on the sofa.|القط ينام على الأريكة.
יש לי ארנב קטן.|I have a small rabbit.|عندي أرنب صغير.
הפיל גדול מאוד.|The elephant is very big.|الفيل كبير جدا.
הציפור שרה בבוקר.|The bird sings in the morning.|الطائر يغني في الصباح.
האריה הוא מלך החיות.|The lion is the king of animals.|الأسد ملك الحيوانات.`,
  },
  {
    id: 'family',
    title: 'משפחה',
    emoji: '👨‍👩‍👧',
    color: '#ce82ff',
    words: `
אמא|mother|أم|אום|👩
אבא|father|أب|אב|👨
אח|brother|أخ|אח'|🧑
אחות|sister|أخت|אוח'ת|👧
סבתא|grandmother|جدة|ג'דה|👵
סבא|grandfather|جد|ג'ד|👴
בן|son|ابن|אבן|👦
בת|daughter|بنت|בנת|🧒
דוד|uncle|عم|עם|🧔
דודה|aunt|عمة|עמה|👩‍🦰
משפחה|family|عائلة|עאילה|👪
תינוק|baby|رضيع|רדיע|👶`,
    sentences: `
אמא שלי מבשלת טוב.|My mother cooks well.|أمي تطبخ جيدا.
יש לי אח אחד ושתי אחיות.|I have one brother and two sisters.|عندي أخ واحد وأختان.
סבא שלי גר בעיר.|My grandfather lives in the city.|جدي يسكن في المدينة.
המשפחה שלי גדולה.|My family is big.|عائلتي كبيرة.
אבא שלי עובד בבית חולים.|My father works in a hospital.|أبي يعمل في مستشفى.
אני אוהב את סבתא.|I love my grandmother.|أحب جدتي.`,
  },
  {
    id: 'food',
    title: 'אוכל',
    emoji: '🍽️',
    color: '#ff4b4b',
    words: `
לחם|bread|خبز|חובז|🍞
חלב|milk|حليب|חליב|🥛
גבינה|cheese|جبنة|ג'בנה|🧀
ביצה|egg|بيضة|בייצה|🥚
אורז|rice|أرز|ארז|🍚
מרק|soup|شوربة|שורבה|🍲
סלט|salad|سلطة|סלטה|🥗
עוף|chicken|دجاج|דג'אג'|🍗
בשר|meat|لحم|לחם|🥩
פיצה|pizza|بيتزا|ביתזא|🍕
עוגה|cake|كعكة|כעכה|🎂
גלידה|ice cream|بوظة|בוט'ה|🍦`,
    sentences: `
אני אוהב פיצה.|I like pizza.|أحب البيتزا.
אני רעב.|I am hungry.|أنا جائع.
אמא מכינה מרק.|Mom is making soup.|أمي تحضر الشوربة.
אני אוכל ביצה לארוחת בוקר.|I eat an egg for breakfast.|آكل بيضة على الفطور.
עוד לחם, בבקשה.|More bread, please.|المزيد من الخبز من فضلك.
העוגה טעימה מאוד.|The cake is very tasty.|الكعكة لذيذة جدا.`,
  },
  {
    id: 'fruit',
    title: 'פירות וירקות',
    emoji: '🍓',
    color: '#89e219',
    words: `
תפוח|apple|تفاحة|תפאחה|🍎
בננה|banana|موزة|מוזה|🍌
תפוז|orange|برتقالة|ברתקאלה|🍊
ענבים|grapes|عنب|ענב|🍇
תות|strawberry|فراولة|פראולה|🍓
אבטיח|watermelon|بطيخ|בטיח'|🍉
לימון|lemon|ليمونة|לימונה|🍋
עגבנייה|tomato|طماطم|טמאטם|🍅
מלפפון|cucumber|خيار|חיאר|🥒
גזר|carrot|جزر|ג'זר|🥕
תפוח אדמה|potato|بطاطا|בטאטא|🥔
בצל|onion|بصل|בצל|🧅`,
    sentences: `
אני אוהב בננות.|I like bananas.|أحب الموز.
התותים מתוקים.|The strawberries are sweet.|الفراولة حلوة.
אני קונה עגבניות בשוק.|I buy tomatoes at the market.|أشتري الطماطم من السوق.
יש לי תפוז בתיק.|I have an orange in my bag.|عندي برتقالة في الحقيبة.
הגזר טוב לעיניים.|Carrots are good for the eyes.|الجزر مفيد للعيون.
אבטיח הוא פרי הקיץ.|Watermelon is the fruit of summer.|البطيخ فاكهة الصيف.`,
  },
  {
    id: 'school',
    title: 'בית ספר',
    emoji: '🏫',
    color: '#2b70c9',
    words: `
ספר|book|كتاب|כיתאב|📖
עט|pen|قلم|קלם|🖊️
מחברת|notebook|دفتر|דפתר|📓
תיק|bag|حقيبة|חקיבה|🎒
מורה|teacher|معلم|מועלם|👩‍🏫
תלמיד|student|طالب|טאלב|🧑‍🎓
כיתה|classroom|صف|צף|🏫
שולחן כתיבה|desk|مكتب|מכתב|🪑
שיעור|lesson|درس|דרס|📚
מבחן|exam|امتحان|אמתחאן|📝
מחק|eraser|ممحاة|ממחאה|🧽
שיעורי בית|homework|واجب|ואג'ב|🏠`,
    sentences: `
המורה כותבת על הלוח.|The teacher writes on the board.|المعلمة تكتب على السبورة.
אני הולך לבית הספר.|I go to school.|أذهب إلى المدرسة.
יש לנו מבחן מחר.|We have a test tomorrow.|عندنا امتحان غدا.
פתחו את הספרים.|Open your books.|افتحوا الكتب.
עשיתי את שיעורי הבית.|I did my homework.|فعلت واجبي.
התלמידים יושבים בכיתה.|The students sit in the classroom.|الطلاب يجلسون في الصف.`,
  },
  {
    id: 'body',
    title: 'הגוף',
    emoji: '🧍',
    color: '#ffb100',
    words: `
ראש|head|رأس|ראס|🙂
עין|eye|عين|עין|👁️
אוזן|ear|أذن|אוד'ן|👂
אף|nose|أنف|אנף|👃
פה|mouth|فم|פם|👄
יד|hand|يد|יד|✋
כף רגל|foot|قدم|קדם|🦶
שן|tooth|سن|סן|🦷
שיער|hair|شعر|שער|💇
לב|heart|قلب|קלב|❤️
גב|back|ظهر|ט'הר|🔙
בטן|stomach|بطن|בטן|🤰`,
    sentences: `
יש לי עיניים חומות.|I have brown eyes.|عندي عينان بنيتان.
כואב לי הראש.|I have a headache.|رأسي يؤلمني.
אני שוטף את הידיים.|I wash my hands.|أغسل يدي.
הלב שלי פועם מהר.|My heart beats fast.|قلبي ينبض بسرعة.
אני מצחצח שיניים.|I brush my teeth.|أنظف أسناني.
הוא מקשיב עם האוזניים.|He listens with his ears.|هو يستمع بأذنيه.`,
  },
  {
    id: 'clothes',
    title: 'בגדים',
    emoji: '👕',
    color: '#ff7043',
    words: `
חולצה|shirt|قميص|קמיץ'|👕
מכנסיים|pants|بنطلون|בנטלון|👖
שמלה|dress|فستان|פסתאן|👗
נעליים|shoes|حذاء|חד'אא|👟
כובע|hat|قبعة|קבעה|🧢
מעיל|coat|معطف|מעטף|🧥
גרביים|socks|جوارب|ג'ואריב|🧦
חצאית|skirt|تنورة|תנורה|💃
צעיף|scarf|وشاح|וישאח'|🧣
כפפות|gloves|قفازات|קפאזאת|🧤
משקפיים|glasses|نظارة|נט'ארה|👓
חגורה|belt|حزام|חזאם|🪢`,
    sentences: `
אני לובש חולצה כחולה.|I am wearing a blue shirt.|ألبس قميصا أزرق.
קר, לבש מעיל.|It is cold, wear a coat.|الجو بارد، البس معطفا.
היא אוהבת את השמלה הזאת.|She likes this dress.|هي تحب هذا الفستان.
איפה הנעליים שלי?|Where are my shoes?|أين حذائي؟
אני צריך כובע לשמש.|I need a hat for the sun.|أحتاج قبعة للشمس.
הגרביים שלי רטובות.|My socks are wet.|جواربي مبللة.`,
  },
  {
    id: 'house',
    title: 'הבית',
    emoji: '🏠',
    color: '#8d6e63',
    words: `
בית|house|بيت|בית|🏠
חדר|room|غرفة|גורפה|🚪
מטבח|kitchen|مطبخ|מטבח'|🍳
דלת|door|باب|באב|🚪
חלון|window|نافذة|נאפד'ה|🪟
מיטה|bed|سرير|סריר|🛏️
כיסא|chair|كرسي|כורסי|🪑
שולחן|table|طاولة|טאולה|🍽️
ספה|sofa|أريكة|אריכה|🛋️
גינה|garden|حديقة|חדיקה|🌳
חדר אמבטיה|bathroom|حمام|חמאם|🛁
מנורה|lamp|مصباح|מצבאח'|💡`,
    sentences: `
הבית שלנו גדול.|Our house is big.|بيتنا كبير.
אני ישן במיטה שלי.|I sleep in my bed.|أنام في سريري.
אמא במטבח.|Mom is in the kitchen.|أمي في المطبخ.
פתח את הדלת, בבקשה.|Open the door, please.|افتح الباب من فضلك.
יש פרחים בגינה.|There are flowers in the garden.|هناك زهور في الحديقة.
הכיסא ליד השולחן.|The chair is next to the table.|الكرسي بجانب الطاولة.`,
  },
  {
    id: 'nature',
    title: 'טבע ומזג אוויר',
    emoji: '☀️',
    color: '#00cd9c',
    words: `
שמש|sun|شمس|שמס|☀️
ירח|moon|قمر|קמר|🌙
כוכב|star|نجمة|נג'מה|⭐
ענן|cloud|غيمة|ע'ימה|☁️
גשם|rain|مطر|מטר|🌧️
שלג|snow|ثلج|תלג'|❄️
רוח|wind|ريح|ריח'|💨
ים|sea|بحر|בחר|🌊
עץ|tree|شجرة|שג'רה|🌲
פרח|flower|زهرة|זהרה|🌷
הר|mountain|جبل|ג'בל|⛰️
נהר|river|نهر|נהר|🏞️`,
    sentences: `
היום יש שמש.|It is sunny today.|اليوم مشمس.
יורד גשם.|It is raining.|السماء تمطر.
בחורף יורד שלג.|It snows in winter.|يتساقط الثلج في الشتاء.
הים כחול ויפה.|The sea is blue and beautiful.|البحر أزرق وجميل.
אני מטפס על ההר.|I am climbing the mountain.|أتسلق الجبل.
הכוכבים זורחים בלילה.|The stars shine at night.|النجوم تلمع في الليل.`,
  },
  {
    id: 'time',
    title: 'זמן וימים',
    emoji: '📅',
    color: '#7c4dff',
    words: `
יום|day|يوم|יום|☀️
לילה|night|ليل|ליל|🌃
בוקר|morning|صباح|סבאח'|🌅
ערב|evening|مساء|מסאא|🌆
היום|today|اليوم|אליום|📅
מחר|tomorrow|غدا|ע'דן|➡️
אתמול|yesterday|أمس|אמס|⬅️
שבוע|week|أسبوع|אסבוע|🗓️
חודש|month|شهر|שהר|🈷️
שנה|year|سنة|סנה|🎆
שעה|hour|ساعة|סאעה|⏰
דקה|minute|دقيقة|דקיקה|⏱️`,
    sentences: `
מחר יום שבת.|Tomorrow is Saturday.|غدا يوم السبت.
אני קם בשבע בבוקר.|I wake up at seven in the morning.|أستيقظ في السابعة صباحا.
אתמול הלכתי לים.|Yesterday I went to the sea.|ذهبت إلى البحر أمس.
יש שישים דקות בשעה.|There are sixty minutes in an hour.|في الساعة ستون دقيقة.
בשנה יש שנים עשר חודשים.|There are twelve months in a year.|في السنة اثنا عشر شهرا.
איזו שעה עכשיו?|What time is it now?|كم الساعة الآن؟`,
  },
  {
    id: 'city',
    title: 'עיר ותחבורה',
    emoji: '🚌',
    color: '#4a6572',
    words: `
עיר|city|مدينة|מדינה|🏙️
רחוב|street|شارع|שארע|🛣️
אוטובוס|bus|حافلة|חאפלה|🚌
מכונית|car|سيارة|סיארה|🚗
רכבת|train|قطار|קטאר|🚆
מטוס|airplane|طائرة|טאאירה|✈️
אופניים|bicycle|دراجة|דראג'ה|🚲
חנות|shop|متجر|מתג'ר|🏪
שוק|market|سوق|סוק|🛒
בית חולים|hospital|مستشفى|מסתשפא|🏥
גשר|bridge|جسر|ג'סר|🌉
תחנה|station|محطة|מחטה|🚏`,
    sentences: `
אני נוסע באוטובוס לבית הספר.|I take the bus to school.|أركب الحافلة إلى المدرسة.
הרכבת מגיעה בעוד חמש דקות.|The train arrives in five minutes.|يصل القطار بعد خمس دقائق.
איפה התחנה?|Where is the station?|أين المحطة؟
אני רוכב על אופניים.|I ride a bicycle.|أركب الدراجة.
יש הרבה מכוניות ברחוב.|There are many cars in the street.|هناك سيارات كثيرة في الشارع.
בית החולים קרוב לגשר.|The hospital is near the bridge.|المستشفى قريب من الجسر.`,
  },
  {
    id: 'verbs',
    title: 'פעולות',
    emoji: '🏃',
    color: '#e91e63',
    words: `
לרוץ|to run|يركض|ירכץ'|🏃
ללכת|to walk|يمشي|ימשי|🚶
לאכול|to eat|يأكل|יאכל|🍽️
לשתות|to drink|يشرب|ישרב|🥤
לקרוא|to read|يقرأ|יקרא|📖
לכתוב|to write|يكتب|יכתב|✍️
לישון|to sleep|ينام|ינאם|😴
לשחק|to play|يلعب|ילעב|⚽
לשיר|to sing|يغني|יע'ני|🎤
לצייר|to draw|يرسم|ירסם|🎨
לפתוח|to open|يفتح|יפתח|🔓
לעזור|to help|يساعد|יסאעד|🤝`,
    sentences: `
אני אוהב לרוץ בפארק.|I like to run in the park.|أحب الجري في الحديقة.
היא קוראת ספר.|She is reading a book.|هي تقرأ كتابا.
אנחנו שותים מים.|We drink water.|نحن نشرب الماء.
הילדים משחקים בחוץ.|The children play outside.|الأطفال يلعبون في الخارج.
אני כותב מכתב לחבר.|I am writing a letter to a friend.|أكتب رسالة إلى صديق.
בבקשה תעזור לי.|Please help me.|من فضلك ساعدني.`,
  },
  {
    id: 'feelings',
    title: 'רגשות ותארים',
    emoji: '😊',
    color: '#f9a825',
    words: `
שמח|happy|سعيد|סעיד|😊
עצוב|sad|حزين|חזין|😢
גדול|big|كبير|כביר|🐘
קטן|small|صغير|צע'יר|🐜
חם|hot|حار|חאר|🥵
קר|cold|بارد|באריד|🥶
מהיר|fast|سريع|סריע|⚡
איטי|slow|بطيء|בטיא|🐢
יפה|beautiful|جميل|ג'מיל|🌺
חדש|new|جديد|ג'דיד|✨
ישן|old|قديم|קדים|🕰️
עייף|tired|متعب|מתעב|🥱`,
    sentences: `
אני שמח היום.|I am happy today.|أنا سعيد اليوم.
הכלב קטן ומהיר.|The dog is small and fast.|الكلب صغير وسريع.
המים קרים מאוד.|The water is very cold.|الماء بارد جدا.
זה ספר חדש.|This is a new book.|هذا كتاب جديد.
אני עייף אחרי בית הספר.|I am tired after school.|أنا متعب بعد المدرسة.
הצב איטי.|The turtle is slow.|السلحفاة بطيئة.`,
  },
]
