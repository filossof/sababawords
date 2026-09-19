import type { Course, Lang, LessonDef, Unit, Word, Writing } from '../types'

const en = (id: string, target: string, he: string): Word => ({ id: `en-${id}`, target, he })
const ar = (id: string, target: string, he: string, translit: string): Word => ({
  id: `ar-${id}`,
  target,
  he,
  translit,
})

const english: Course = {
  lang: 'en',
  units: [
    {
      id: 'en-basics',
      title: 'יסודות',
      emoji: '👋',
      words: [
        en('hello', 'hello', 'שלום'),
        en('goodbye', 'goodbye', 'להתראות'),
        en('thanks', 'thank you', 'תודה'),
        en('please', 'please', 'בבקשה'),
        en('yes', 'yes', 'כן'),
        en('no', 'no', 'לא'),
      ],
    },
    {
      id: 'en-colors',
      title: 'צבעים',
      emoji: '🎨',
      words: [
        en('red', 'red', 'אדום'),
        en('blue', 'blue', 'כחול'),
        en('green', 'green', 'ירוק'),
        en('yellow', 'yellow', 'צהוב'),
        en('white', 'white', 'לבן'),
        en('black', 'black', 'שחור'),
      ],
    },
    {
      id: 'en-animals',
      title: 'חיות',
      emoji: '🐶',
      words: [
        en('dog', 'dog', 'כלב'),
        en('cat', 'cat', 'חתול'),
        en('bird', 'bird', 'ציפור'),
        en('fish', 'fish', 'דג'),
        en('horse', 'horse', 'סוס'),
        en('cow', 'cow', 'פרה'),
      ],
    },
    {
      id: 'en-family',
      title: 'משפחה',
      emoji: '👨‍👩‍👧',
      words: [
        en('mother', 'mother', 'אמא'),
        en('father', 'father', 'אבא'),
        en('brother', 'brother', 'אח'),
        en('sister', 'sister', 'אחות'),
        en('grandmother', 'grandmother', 'סבתא'),
        en('grandfather', 'grandfather', 'סבא'),
      ],
    },
    {
      id: 'en-school',
      title: 'בית ספר',
      emoji: '🏫',
      words: [
        en('book', 'book', 'ספר'),
        en('pen', 'pen', 'עט'),
        en('teacher', 'teacher', 'מורה'),
        en('school', 'school', 'בית ספר'),
        en('desk', 'desk', 'שולחן'),
        en('bag', 'bag', 'תיק'),
      ],
    },
  ],
}

const arabic: Course = {
  lang: 'ar',
  units: [
    {
      id: 'ar-basics',
      title: 'יסודות',
      emoji: '👋',
      words: [
        ar('hello', 'مرحبا', 'שלום', 'מַרְחַבָּא'),
        ar('goodbye', 'مع السلامة', 'להתראות', 'מַע אסַּלַאמָה'),
        ar('thanks', 'شكرا', 'תודה', 'שֻׁכְּרַן'),
        ar('please', 'من فضلك', 'בבקשה', 'מִן פַדְלִכּ'),
        ar('yes', 'نعم', 'כן', 'נַעַם'),
        ar('no', 'لا', 'לא', 'לָא'),
      ],
    },
    {
      id: 'ar-colors',
      title: 'צבעים',
      emoji: '🎨',
      words: [
        ar('red', 'أحمر', 'אדום', 'אַחְמַר'),
        ar('blue', 'أزرق', 'כחול', 'אַזְרַק'),
        ar('green', 'أخضر', 'ירוק', 'אַח׳ְצַ׳ר'),
        ar('yellow', 'أصفر', 'צהוב', 'אַצְפַר'),
        ar('white', 'أبيض', 'לבן', 'אַבְּיַצ׳'),
        ar('black', 'أسود', 'שחור', 'אַסְוַד'),
      ],
    },
    {
      id: 'ar-animals',
      title: 'חיות',
      emoji: '🐶',
      words: [
        ar('dog', 'كلب', 'כלב', 'כַּלְבּ'),
        ar('cat', 'قطة', 'חתולה', 'קִטָּה'),
        ar('bird', 'طائر', 'ציפור', 'טַאאִר'),
        ar('fish', 'سمكة', 'דג', 'סַמַכָּה'),
        ar('horse', 'حصان', 'סוס', 'חִצַ׳אן'),
        ar('cow', 'بقرة', 'פרה', 'בַּקַרָה'),
      ],
    },
    {
      id: 'ar-family',
      title: 'משפחה',
      emoji: '👨‍👩‍👧',
      words: [
        ar('mother', 'أم', 'אמא', 'אֻם'),
        ar('father', 'أب', 'אבא', 'אַבּ'),
        ar('brother', 'أخ', 'אח', 'אַח׳'),
        ar('sister', 'أخت', 'אחות', 'אֻח׳ְת'),
        ar('grandmother', 'جدة', 'סבתא', 'ג׳ַדָּה'),
        ar('grandfather', 'جد', 'סבא', 'ג׳ַד'),
      ],
    },
    {
      id: 'ar-school',
      title: 'בית ספר',
      emoji: '🏫',
      words: [
        ar('book', 'كتاب', 'ספר', 'כִּתַאבּ'),
        ar('pen', 'قلم', 'עט', 'קַלַם'),
        ar('teacher', 'معلم', 'מורה', 'מֻעַלִּם'),
        ar('school', 'مدرسة', 'בית ספר', 'מַדְרַסַה'),
        ar('desk', 'مكتب', 'שולחן', 'מַכְתַבּ'),
        ar('bag', 'حقيبة', 'תיק', 'חַקִיבַּה'),
      ],
    },
  ],
}

export const courses: Record<Lang, Course> = { en: english, ar: arabic }

export const langInfo: Record<Lang, { he: string; native: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { he: 'אנגלית', native: 'English', flag: '🇬🇧', dir: 'ltr' },
  ar: { he: 'ערבית', native: 'العربية', flag: '🇸🇦', dir: 'rtl' },
}

/**
 * Writing is introduced gradually: the first units are recognition only, then letter tiles
 * (English), and typing only later. Arabic typing is harder, so it comes last.
 */
function writingFor(lang: Lang, unitIndex: number): Writing {
  if (lang === 'en') return unitIndex === 0 ? 'none' : unitIndex === 1 ? 'scramble' : 'type'
  return unitIndex < 3 ? 'none' : 'type'
}

/** Each unit has 3 lessons: two intro lessons (3 words each) and a review of all its words. */
export function unitLessons(course: Course, unit: Unit): LessonDef[] {
  const writing = writingFor(course.lang, course.units.indexOf(unit))
  return [
    { id: `${unit.id}-a`, title: 'שיעור 1', words: unit.words.slice(0, 3), intro: true, writing },
    { id: `${unit.id}-b`, title: 'שיעור 2', words: unit.words.slice(3, 6), intro: true, writing },
    { id: `${unit.id}-c`, title: 'חזרה', words: unit.words, intro: false, writing },
  ]
}

export function allLessons(course: Course): LessonDef[] {
  return course.units.flatMap((u) => unitLessons(course, u))
}

export function allWords(course: Course): Word[] {
  return course.units.flatMap((u) => u.words)
}
