/**
 * Library Constants
 *
 * Single source of truth for all library data.
 * Shared by Library Category screen and Book Detail screen.
 *
 * sourceUrl status:
 * ✅ Free PDF or official download page — verified legitimate source
 * ⚠️  Publisher page — book may be copyrighted, URL points to purchase/info page
 * ❌ No legitimate free source found — consider removing or replacing
 */

// ============================================
// TYPES
// ============================================

export interface BookPart {
  number: number;
  title: string;
  subtitle: string;
  startPage: number;
  endPage: number;
  isReading?: boolean;
}

export interface LibraryBook {
  id: string;
  title: string;
  arabicTitle: string;
  author: string;
  language: string;
  size: string;
  categoryId: string;
  sourceUrl: string;
  pages: number;
  parts: number;
  about: string;
  partsList?: BookPart[];
  progress?: number;
  currentPart?: number;
}

// ============================================
// CATEGORY NAMES
// ============================================

export const CATEGORY_NAMES: Record<
  string,
  { name: string; arabicName: string }
> = {
  "quran-tafsir": { name: "Quran & Tafsir", arabicName: "القرآن والتفسير" },
  hadith: { name: "Hadith", arabicName: "الحديث الشريف" },
  fiqh: { name: "Fiqh", arabicName: "الفقه الإسلامي" },
  aqeedah: { name: "Aqeedah", arabicName: "العقيدة الإسلامية" },
  seerah: { name: "Seerah", arabicName: "السيرة النبوية" },
  history: { name: "Islamic History", arabicName: "التاريخ الإسلامي" },
  fatwa: { name: "Fatwa", arabicName: "الفتوى" },
  kids: { name: "Children's Books", arabicName: "كتب الأطفال" },
  ethics: { name: "Islamic Ethics", arabicName: "الأخلاق الإسلامية" },
};

// ============================================
// BOOKS DATA
// ============================================

export const BOOKS: LibraryBook[] = [
  // ═══════════════════════════════════════
  // QURAN & TAFSIR
  // ═══════════════════════════════════════
  {
    id: "q1",
    title: "Tafsir Ibn Kathir",
    arabicTitle: "تفسير ابن كثير",
    author: "Imam Ibn Kathir",
    language: "English",
    size: "24 MB",
    categoryId: "quran-tafsir",
    sourceUrl: "https://dn720701.ca.archive.org/0/items/TafsirIbnKathir_795/TafsirIbnKathirAll10Volumes.pdf",
    pages: 0,
    parts: 0,

    about:
      "Tafsir Ibn Kathir is a classical commentary on the Quran by Imam Ibn Kathir (Ibn Kathir al-Dimashqi). It explains Quranic verses through references to other verses of the Quran, Prophetic narrations, reports from the Companions and early generations, and discussions of relevant scholarly interpretations. It is one of the most widely known classical works of Quranic tafsir and is commonly used as a reference for studying the meanings and context of Quranic verses. This edition provides the work in English for readers seeking to explore the Quran with additional classical commentary.",
  },
  {
    id: "q2",
    title: "Tafsir al-Jalalayn",
    arabicTitle: "تفسير الجلالين",
    author: "Jalal ad-Din al-Mahalli & Jalal ad-Din as-Suyuti",
    language: "English",
    size: "8 MB",
    categoryId: "quran-tafsir",
    sourceUrl: "https://dn760108.eu.archive.org/0/items/TAFSEERJALALAINENGLISHTRANSLATION/TAFSEER_JALALAIN_ENGLISH_TRANSLATION.pdf",
    pages: 702,
    parts: 1,

    about:
      "Tafsir al-Jalalayn, meaning “The Commentary of the Two Jalals,” is a concise classical commentary on the Quran begun by Jalal ad-Din al-Mahalli and completed by his student, Jalal ad-Din as-Suyuti. Its concise style and focus on explaining the apparent and linguistic meanings of the Quran have made it one of the widely studied classical works of tafsir. This English edition was translated by Dr. Feras Hamza and published by Fons Vitae in collaboration with the Royal Aal al-Bayt Institute for Islamic Thought. It provides English-speaking readers with access to the complete classical commentary in a single volume.",
  },
  {
    id: "q3",
    title: "In the Shade of the Quran",
    arabicTitle: "في ظلال القرآن",
    author: "Sayyid Qutb",
    language: "English",
    size: "42 MB",
    categoryId: "quran-tafsir",
    sourceUrl: "https://archive.org/details/quran-tafsir-in-the-shade-of-the-quran-sayyid-qutb-eng-full-pdf_202208",
    pages: 0,
    parts: 18,

    about:
      "In the Shade of the Quran (Fi Zilal al-Quran) is a modern Quranic commentary by Sayyid Qutb. Written between 1951 and 1965, the work reflects on the Quran through spiritual, social and contemporary perspectives, connecting its guidance with the life and development of the individual and Muslim society. The original Arabic work covers the entire Quran and was published across 30 volumes. The English edition was translated by Adil Salahi and published as an 18-volume series by the Islamic Foundation. It offers readers a modern interpretive approach to the Quran alongside its broader reflections on faith, character and society.",
  },
  {
    id: "q4",
    title: "Ma'ariful Quran",
    arabicTitle: "معارف القرآن",
    author: "Mufti Muhammad Shafi",
    language: "English",
    size: "35 MB",
    categoryId: "quran-tafsir",
    sourceUrl: "https://www.australianislamiclibrary.org/maarif-ul-quran.html",
    pages: 5980,
    parts: 8,

    about:
      "Ma'ariful Quran is a comprehensive Quranic commentary originally written in Urdu by Mufti Muhammad Shafi, a prominent Islamic scholar and former Grand Mufti of Pakistan. The work explains the meanings and guidance of the Quran while drawing upon classical Islamic scholarship and addressing matters of faith, worship, law and everyday life. The English edition was translated by Prof. Muhammad Hasan Askari and Prof. Muhammad Shamim and revised by Mufti Muhammad Taqi Usmani. Published in eight volumes, it provides English-speaking readers with an extensive commentary covering the entire Quran.",
  },
  {
    id: "q5",
    title: "Tafhim al-Quran",
    arabicTitle: "تفهيم القرآن",
    author: "Abul A'la Maududi",
    language: "English",
    size: "38 MB",
    categoryId: "quran-tafsir",
    sourceUrl: "https://alhamdolillah.com/book/tafheem-ul-quran-english-syed-abul-ala-maududi/",
    pages: 4020,
    parts: 6,

    about:
      "Tafhim al-Quran, meaning 'Towards Understanding the Quran', is a comprehensive Quranic commentary by the Pakistani scholar Abul A'la Maududi. Written over several decades and completed in 1972, the work combines Quranic translation and commentary with discussions of the historical, social, moral, economic and legal guidance found in the Quran. Each Surah is introduced with background and an overview of its themes, followed by detailed explanation of its verses. The English edition presents Maududi's work for readers who want to study the Quran alongside a modern, accessible commentary.",
  },
  {
    id: "q6",
    title: "Al-Quran (Uthmani Script)",
    arabicTitle: "القرآن الكريم — المصحف العثماني",
    author: "King Fahd Glorious Quran Printing Complex",
    language: "Arabic",
    size: "15 MB",
    categoryId: "quran-tafsir",
    sourceUrl: "https://alhamdolillah.com/book/al-quranal-quran-arabic-king-fahad-complex/",
    pages: 604,
    parts: 1,

    about:
      "A complete Arabic Mushaf presented in the Uthmani script based on the Madinah Mushaf tradition. The King Fahd Glorious Quran Printing Complex in Madinah has played a major role in the printing, preservation and digital publication of the Quran, including digitally processed versions of the Madinah Mushaf. The 604-page format corresponds to the digitally processed Madinah Mushaf edition described by the Complex. This resource provides readers with a traditional Mushaf-style presentation of the Quran in Arabic.",
  },

  // ═══════════════════════════════════════
  // HADITH
  // ═══════════════════════════════════════
  {
  id: 'h1',
  title: 'Sahih al-Bukhari',
  arabicTitle: 'صحيح البخاري',
  author: 'Imam Muhammad al-Bukhari',
  language: 'English',
  size: '28 MB',
  categoryId: 'hadith',
  sourceUrl: 'https://sunnah.com/bukhari',
  pages: 0,
  parts: 0,

  about:
    'Sahih al-Bukhari, formally known as Al-Jami al-Sahih, is one of the most widely studied collections of Prophetic hadith. It was compiled by Imam Muhammad ibn Ismail al-Bukhari and organized into books and chapters covering matters of faith, worship, character, transactions, history and other aspects of Islamic life. The collection is particularly known for the rigorous standards Imam al-Bukhari applied in selecting and arranging narrations. Deen Companion provides access to the collection through an external source so that users can explore its books, chapters and individual hadith in an organized manner.'
},
  {
  id: 'h2',
  title: 'Sahih Muslim',
  arabicTitle: 'صحيح مسلم',
  author: 'Imam Muslim ibn al-Hajjaj',
  language: 'English',
  size: '26 MB',
  categoryId: 'hadith',
  sourceUrl: 'https://sunnah.com/muslim',
  pages: 0,
  parts: 0,

  about:
    'Sahih Muslim, formally known as Al-Musnad al-Sahih, is one of the major classical collections of Prophetic hadith. It was compiled by Imam Muslim ibn al-Hajjaj and arranged into books covering subjects including faith, worship, manners, family life, transactions and other aspects of Islamic teachings. Imam Muslim is particularly known for his careful attention to the chains of transmission and the organization of related narrations. Along with Sahih al-Bukhari, the collection has held a central place in Sunni hadith scholarship for centuries. Deen Companion provides access to the collection through an external source, allowing users to explore its books, chapters and individual hadith in an organized manner.'
},
  {
  id: 'h3',
  title: 'Sunan Abu Dawud',
  arabicTitle: 'سنن أبي داود',
  author: 'Imam Abu Dawud',
  language: 'English',
  size: '18 MB',
  categoryId: 'hadith',
  sourceUrl: 'https://sunnah.com/abudawud',
  pages: 0,
  parts: 0,

  about:
    'Sunan Abu Dawud is one of the major classical collections of Prophetic hadith, compiled by Imam Abu Dawud Sulayman ibn al-Ashath al-Sijistani. The collection places particular emphasis on narrations related to Islamic legal and practical matters, covering subjects such as purification, prayer, fasting, marriage, transactions, conduct and other areas of religious practice. It is one of the six major hadith collections commonly referred to as the Kutub al-Sittah. The collection includes narrations with differing levels of scholarly assessment, making its original classification and the evaluation of individual hadith important when studying its contents. Deen Companion provides access to the collection through an external source, allowing users to explore its books, chapters and individual hadith in an organized manner.'
},
  {
  id: 'h4',
  title: "Jami' at-Tirmidhi",
  arabicTitle: 'جامع الترمذي',
  author: 'Imam at-Tirmidhi',
  language: 'English',
  size: '16 MB',
  categoryId: 'hadith',
  sourceUrl: 'https://sunnah.com/tirmidhi',
  pages: 0,
  parts: 0,

  about:
    "Jami' at-Tirmidhi is one of the major classical collections of Prophetic hadith, compiled by Imam Muhammad ibn Isa at-Tirmidhi. The collection covers a broad range of subjects including faith, worship, manners, transactions, legal matters and other aspects of Islamic life. It is particularly notable for Imam at-Tirmidhi's inclusion of comments concerning the status and transmission of narrations, as well as references to scholarly opinions on legal questions. The collection is one of the six major hadith books commonly known as the Kutub al-Sittah. Its narrations have differing classifications, making the study of individual hadith and their scholarly grading an important part of using the collection."
},
{
  id: 'h5',
  title: "Sunan an-Nasa'i",
  arabicTitle: 'سنن النسائي',
  author: 'Imam an-Nasa\'i',
  language: 'English',
  size: '17 MB',
  categoryId: 'hadith',
  sourceUrl: 'https://sunnah.com/nasai',
  pages: 0,
  parts: 0,

  about:
    "Sunan an-Nasa'i is a major classical collection of Prophetic hadith compiled by Imam Ahmad ibn Shuayb an-Nasa'i. The work is organized primarily around subjects related to Islamic law and practice, including purification, prayer, fasting, zakat, pilgrimage, marriage, transactions and other areas of religious life. Imam an-Nasa'i is known for his careful approach to hadith transmission and narrator evaluation. The collection is one of the six major hadith books commonly known as the Kutub al-Sittah. As with other Sunan collections, individual narrations can have different scholarly assessments, so the classification of a particular hadith should be considered when studying or using it as evidence."
},
{
  id: 'h6',
  title: 'Sunan Ibn Majah',
  arabicTitle: 'سنن ابن ماجه',
  author: 'Imam Ibn Majah',
  language: 'English',
  size: '15 MB',
  categoryId: 'hadith',
  sourceUrl: 'https://sunnah.com/ibnmajah',
  pages: 0,
  parts: 0,

  about:
    'Sunan Ibn Majah is a classical collection of Prophetic hadith compiled by Imam Muhammad ibn Yazid Ibn Majah. It covers a wide range of subjects including purification, prayer, fasting, pilgrimage, marriage, transactions, manners and other aspects of Islamic life. The collection is traditionally counted among the six major hadith books known as the Kutub al-Sittah. Its contents include narrations with different levels of scholarly assessment, including reports that later scholars have classified as authentic, weak or otherwise evaluated differently. For this reason, individual hadith should be considered together with their available scholarly grading and supporting evidence.'
},

  // ═══════════════════════════════════════
  // FIQH
  // ═══════════════════════════════════════
 {
  id: 'f1',
  title: 'Reliance of the Traveller',
  arabicTitle: 'عمدة السالك وعدة الناسك',
  author: 'Ahmad ibn Naqib al-Misri',
  language: 'English',
  size: '22 MB',
  categoryId: 'fiqh',
  sourceUrl: 'https://www.amana-publications.com/',
  pages: 0,
  parts: 1,

  about:
    'Reliance of the Traveller is a classical manual of Islamic jurisprudence by Ahmad ibn Naqib al-Misri, a scholar of the Shafi‘i school. The work presents rulings across major areas of Islamic law, including purification, prayer, fasting, zakat, pilgrimage, transactions, marriage and other matters of religious practice. The English edition has made this important Shafi‘i legal text accessible to English-speaking readers and includes material explaining the terminology and structure of the classical work. It is particularly useful for readers seeking to study Islamic jurisprudence through the framework of the Shafi‘i school.'
},{
  id: 'f2',
  title: 'Al-Muwatta',
  arabicTitle: 'الموطأ',
  author: 'Imam Malik ibn Anas',
  language: 'English',
  size: '14 MB',
  categoryId: 'fiqh',
    sourceUrl: '',
  pages: 0,
  parts: 1,

  about:
    'Al-Muwatta is one of the earliest major Islamic compilations of hadith and legal practice, compiled by Imam Malik ibn Anas. The work brings together Prophetic hadith, reports from the Companions and Successors, and legal opinions and practices associated with the scholars of Madinah. Its chapters cover subjects including purification, prayer, zakat, fasting, pilgrimage, marriage, transactions and other areas of Islamic practice. Al-Muwatta occupies an important place in both hadith and Islamic jurisprudence and provides valuable insight into the early development of legal thought.'
},{
  id: 'f3',
  title: 'Bulugh al-Maram',
  arabicTitle: 'بلوغ المرام من أدلة الأحكام',
  author: 'Ibn Hajar al-Asqalani',
  language: 'English',
  size: '9 MB',
  categoryId: 'fiqh',
  sourceUrl: 'https://d1.islamhouse.com/data/en/ih_books/single/en_Bulugh_Al-Maram.pdf',
  pages: 0,
  parts: 1,

  about:
    'Bulugh al-Maram min Adillat al-Ahkam is a classical collection of hadith compiled by Ibn Hajar al-Asqalani with a particular focus on narrations used as evidence for Islamic legal rulings. The work is organized according to subjects of jurisprudence, including purification, prayer, fasting, zakat, pilgrimage, marriage, transactions and other areas of law. Ibn Hajar identifies the primary hadith sources for the narrations, making the work especially useful for readers studying the relationship between hadith evidence and fiqh rulings. It has been widely used as a foundational text for studying hadith-based legal evidence.'
},{
  id: 'f4',
  title: 'Fiqh us-Sunnah',
  arabicTitle: 'فقه السنة',
  author: 'Sayyid Sabiq',
  language: 'English',
  size: '12 MB',
  categoryId: 'fiqh',
  sourceUrl: 'https://d1.islamhouse.com/data/en/ih_books/single/en_Fiqh-us-Sunnah.pdf',
  pages: 0,
  parts: 3,

  about:
    'Fiqh us-Sunnah is a modern work of Islamic jurisprudence by Sayyid Sabiq that presents rulings on a wide range of acts of worship and practical matters of Islamic life while drawing extensively upon Quranic and hadith evidence. The work covers subjects including purification, prayer, zakat, fasting, pilgrimage, marriage, transactions and other areas of Islamic practice. Its approach emphasizes presenting the textual evidence behind legal rulings and discussing different scholarly positions, making it accessible to readers who want to study fiqh alongside its underlying sources.'
},{
  id: 'f5',
  title: 'The Treatise on Rights',
  arabicTitle: 'رسالة الحقوق',
  author: 'Imam Zain al-Abidin',
  language: 'English',
  size: '3 MB',
  categoryId: 'ethics',
  sourceUrl: '',
  pages: 0,
  parts: 1,

  about:
    'The Treatise on Rights (Risalat al-Huquq) is a work on ethical and spiritual responsibilities attributed to Imam Ali ibn al-Husayn Zain al-Abidin. It presents a detailed discussion of the rights and responsibilities that shape a person’s relationship with God, oneself, family, society and other people. Rather than functioning as a conventional manual of jurisprudence, the work focuses on character, conduct, moral responsibility and the cultivation of a disciplined spiritual life. It provides a valuable perspective on Islamic ethics and the responsibilities that accompany faith and everyday relationships.'
},{
  id: 'f6',
  title: 'Al-Umdah fi al-Fiqh',
  arabicTitle: 'العمدة في الفقه',
  author: 'Ibn Qudamah al-Maqdisi',
  language: 'Arabic',
  size: '6 MB',
  categoryId: 'fiqh',
  sourceUrl: '',
  pages: 0,
  parts: 1,

  about:
    'Al-Umdah fi al-Fiqh is a concise classical manual of Islamic jurisprudence by Ibn Qudamah al-Maqdisi. It presents the foundational rulings of worship and other areas of Islamic law according to the Hanbali school. The work is known for its concise presentation and has traditionally been used as an introductory text for students studying Hanbali jurisprudence. Its structured treatment of legal subjects makes it useful for readers who want to explore the principles and rulings of a particular classical school of fiqh.'
},

  // ═══════════════════════════════════════
  // AQEEDAH
  // ═══════════════════════════════════════
 {
  id: 'a1',
  title: 'The Book of Tawheed',
  arabicTitle: 'كتاب التوحيد',
  author: 'Sheikh Muhammad ibn Abdul Wahhab',
  language: 'English',
  size: '5 MB',
  categoryId: 'aqeedah',
  sourceUrl: '',
  pages: 0,
  parts: 1,

  about:
    'The Book of Tawheed (Kitab at-Tawhid) is a theological work by Muhammad ibn Abdul Wahhab focused on the concept of tawhid, the oneness of God. The work discusses different aspects of worship and examines practices and beliefs that the author considers consistent with or contrary to tawhid. It draws extensively upon verses of the Quran and Prophetic hadith to support its discussions. The book has become an influential text within the theological tradition associated with its author and is widely studied alongside other works on Islamic creed.'
},{
  id: 'a2',
  title: 'Aqeedah at-Tahawiyyah',
  arabicTitle: 'العقيدة الطحاوية',
  author: "Imam Abu Ja'far at-Tahawi",
  language: 'English',
  size: '4 MB',
  categoryId: 'aqeedah',
  sourceUrl: '',
  pages: 0,
  parts: 1,

  about:
    'Aqeedah at-Tahawiyyah is a concise statement of Islamic creed attributed to Imam Abu Ja‘far al-Tahawi. The work presents fundamental beliefs concerning God, His attributes, prophethood, revelation, faith, the unseen, the Companions and other matters of Islamic theology. It became an important classical text in the study of Sunni creed and has been commented upon by numerous scholars throughout Islamic history. Its concise format makes it particularly suitable as an introductory text for readers beginning the study of Islamic theology.'
},{
  id: 'a3',
  title: 'Kitab al-Tawhid',
  arabicTitle: 'كتاب التوحيد',
  author: 'Imam Ibn Khuzaymah',
  language: 'Arabic',
  size: '8 MB',
  categoryId: 'aqeedah',
  sourceUrl: '',
  pages: 0,
  parts: 1,

  about:
    'Kitab al-Tawhid is a classical theological work attributed to Imam Muhammad ibn Ishaq Ibn Khuzaymah. The work discusses matters relating to the oneness of God and divine attributes, presenting Quranic verses, Prophetic narrations and theological arguments in support of its positions. It is an important historical source for studying early Sunni theological literature and the approaches of classical scholars to questions concerning God and His attributes. The work is presented in Arabic in this Library collection.'
},{
  id: 'a4',
  title: 'The Four Rules Regarding Shirk',
  arabicTitle: 'القواعد الأربع',
  author: 'Muhammad ibn Abdul Wahhab',
  language: 'English',
  size: '2 MB',
  categoryId: 'aqeedah',
  sourceUrl: '',
  pages: 0,
  parts: 1,

  about:
    'The Four Rules Regarding Shirk (Al-Qawaid al-Arba) is a concise theological treatise by Muhammad ibn Abdul Wahhab addressing the concept of shirk and the distinctions the author makes between different forms of worship and association with God. The work presents four foundational principles supported by Quranic verses and Prophetic narrations. It is commonly studied as an introductory text within the theological tradition associated with its author and is intended to provide a concise framework for understanding the author’s treatment of tawhid and shirk.'
},{
  id: 'a5',
  title: 'Essay on the Heart',
  arabicTitle: 'رسالة في القلب',
  author: 'Ibn Taymiyyah',
  language: 'English',
  size: '6 MB',
  categoryId: 'aqeedah',
  sourceUrl: '',
  pages: 0,
  parts: 1,
  about:
    'Essay on the Heart is a work attributed to Ibn Taymiyyah that discusses the spiritual and religious significance of the heart in Islam. It explores the relationship between the heart, faith, intention and human actions, emphasizing the importance of cultivating sincerity and strengthening one’s relationship with Allah. The work presents the heart as central to a person’s spiritual condition and religious life, making its purification and proper guidance an important part of Islamic spiritual development.'
},

  // ═══════════════════════════════════════
  // SEERAH
  // ═══════════════════════════════════════
  
  {
    id: 's1',
    title: 'The Sealed Nectar',
    arabicTitle: 'الرحيق المختوم',
    author: 'Safiur Rahman Mubarakpuri',
    language: 'English',
    size: '12 MB',
    categoryId: 'seerah',
    sourceUrl: '',
    pages: 604,
    parts: 3,
    about:
      'The Sealed Nectar (Ar-Raheeq Al-Makhtum) is a detailed biography of the Prophet Muhammad ﷺ by Safiur Rahman Mubarakpuri. The work traces the life of the Prophet ﷺ from his ancestry and the early history of Arabia through his birth, the beginning of revelation, the Makkan period, the Hijrah, the establishment of the Muslim community in Madinah, major events and expeditions, and the final years of his life. The book was awarded first place in the biography competition organized by the Muslim World League in 1979 and has become a widely read modern work of Seerah.',
    
  },

  {
    id: 's2',
    title: 'Ar-Raheeq Al-Makhtum',
    arabicTitle: 'الرحيق المختوم',
    author: 'Safiur Rahman Mubarakpuri',
    language: 'Arabic',
    size: '18 MB',
    categoryId: 'seerah',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Ar-Raheeq Al-Makhtum is the original Arabic work by Safiur Rahman Mubarakpuri and presents a detailed account of the life of the Prophet Muhammad ﷺ. It covers the historical background of Arabia, the Prophet’s lineage and early life, the beginning of revelation, the Makkan and Madinan periods, major events during his mission, and his final years. The work is a modern Seerah study and was recognized in the 1979 Muslim World League competition for the biography of the Prophet ﷺ.'
  },

  {
    id: 's3',
    title: 'Muhammad: His Life Based on the Earliest Sources',
    arabicTitle: '',
    author: 'Martin Lings',
    language: 'English',
    size: '15 MB',
    categoryId: 'seerah',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Muhammad: His Life Based on the Earliest Sources is a modern biography of the Prophet Muhammad ﷺ by Martin Lings. The work reconstructs the life of the Prophet ﷺ using early Islamic historical and biographical sources, covering his ancestry and birth, the beginning of revelation, the Makkan period, the migration to Madinah, the development of the Muslim community, major events of the Prophetic mission, and his final years. The book is widely known for its literary presentation of the Seerah while remaining closely connected to early source material.'
  },

  {
    id: 's4',
    title: "Ash-Shama'il Al-Muhammadiyyah",
    arabicTitle: 'الشمائل المحمدية',
    author: 'Imam at-Tirmidhi',
    language: 'English',
    size: '9 MB',
    categoryId: 'seerah',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      "Ash-Shama'il Al-Muhammadiyyah is a classical collection by Imam at-Tirmidhi describing the appearance, character, habits, manners and personal qualities of the Prophet Muhammad ﷺ. The work brings together narrations concerning the Prophet's physical characteristics, clothing, food, worship, conduct, interactions and other aspects of his daily life. It provides readers with a focused collection of reports about the personal qualities and way of life of the Prophet ﷺ and is an important classical work in the study of the Shama'il tradition."
  },

  {
    id: 's5',
    title: "Zad al-Ma'ad (Provisions of the Hereafter)",
    arabicTitle: 'زاد المعاد',
    author: 'Ibn Qayyim al-Jawziyya',
    language: 'English',
    size: '21 MB',
    categoryId: 'seerah',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      "Zad al-Ma'ad fi Hady Khayr al-'Ibad is a wide-ranging classical work by Ibn Qayyim al-Jawziyya examining the guidance and practice of the Prophet Muhammad ﷺ. The work combines Seerah, hadith, worship, jurisprudence, manners and practical guidance, using the Prophetic example as a basis for discussing different aspects of religious life. It includes discussions of the Prophet's worship, conduct, dealings, health, battles and other aspects of his guidance. Because of its broad scope, the work is relevant not only to Seerah but also to the study of hadith and Islamic jurisprudence."
  },

  {
    id: 's6',
    title: 'When the Moon Split',
    arabicTitle: 'حين انشق القمر',
    author: 'Safiur Rahman Mubarakpuri',
    language: 'English',
    size: '10 MB',
    categoryId: 'seerah',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'When the Moon Split is a work on the life and mission of the Prophet Muhammad ﷺ by Safiur Rahman Mubarakpuri. It presents key events from the Prophetic biography, including the early life of the Prophet ﷺ, the beginning of revelation, the Makkan period, the migration to Madinah, major events of the Madinan period and the final stages of his mission. The work provides a concise introduction to the Seerah for readers who want to become familiar with the major events of the Prophet’s life.'
  },


  // ═══════════════════════════════════════
  // ISLAMIC HISTORY
  // ═══════════════════════════════════════
  
  {
    id: 'hi1',
    title: 'The History of the Khalifahs',
    arabicTitle: 'تاريخ الخلفاء',
    author: 'Imam as-Suyuti',
    language: 'English',
    size: '7 MB',
    categoryId: 'history',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'The History of the Khalifahs (Tarikh al-Khulafa) is a classical historical work by Imam Jalal al-Din al-Suyuti covering the lives and reigns of the Muslim caliphs from the period following the Prophet Muhammad ﷺ. The work presents biographical information, major events, achievements and historical accounts relating to the caliphs and rulers of the early Islamic period. It provides a useful overview of the development of the Muslim political community and the succession of its major leaders across the early centuries of Islamic history.'
  },

  {
    id: 'hi2',
    title: 'The Venture of Islam',
    arabicTitle: '',
    author: 'Marshall G. S. Hodgson',
    language: 'English',
    size: '45 MB',
    categoryId: 'history',
    sourceUrl: '',
    pages: 0,
    parts: 3,
    about:
      'The Venture of Islam is a major three-volume study of Islamic history by historian Marshall G. S. Hodgson. The work examines the development of Islamic civilization from its origins through the early modern period, placing religious, political, economic, intellectual and cultural developments within their wider historical context. Rather than focusing solely on political events, Hodgson explores the formation and transformation of Islamic societies and their interactions with the wider world. It is a substantial academic work useful for readers seeking a broad historical understanding of the Muslim world.'
  },

  {
    id: 'hi3',
    title: 'The Decline and Fall of the Caliphate',
    arabicTitle: '',
    author: 'M. A. Shakoor',
    language: 'English',
    size: '11 MB',
    categoryId: 'history',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'The Decline and Fall of the Caliphate examines the historical development and eventual decline of the institution of the Muslim caliphate. The work discusses political and historical developments that shaped the Muslim world and contributed to changes in the structure and authority of the caliphate. It provides readers with a historical perspective on the transformation of Muslim political institutions and the circumstances surrounding the end of the traditional caliphal system.'
  },

  {
    id: 'hi4',
    title: 'Stories of the Prophets',
    arabicTitle: 'قصص الأنبياء',
    author: 'Ibn Kathir',
    language: 'English',
    size: '13 MB',
    categoryId: 'history',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Stories of the Prophets (Qisas al-Anbiya) is a classical work attributed to Ibn Kathir presenting accounts of the prophets mentioned in the Quran and Islamic tradition. The work draws upon Quranic verses, Prophetic narrations and earlier historical reports to recount the lives, missions and experiences of the prophets. It covers figures including Adam, Nuh, Ibrahim, Musa, Isa and other prophets, placing their stories within the broader framework of Islamic teachings and history.'
  },

  {
    id: 'hi5',
    title: 'Futuh al-Buldan',
    arabicTitle: 'فتوح البلدان',
    author: 'Ahmad ibn Yahya al-Baladhuri',
    language: 'Arabic',
    size: '16 MB',
    categoryId: 'history',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Futuh al-Buldan (The Origins of the Islamic State) is a major early historical work by Ahmad ibn Yahya al-Baladhuri documenting the expansion of the early Muslim state. The work records accounts concerning the conquest and incorporation of different regions, including details about treaties, taxation, administration, settlements and relations between the Muslim authorities and local populations. Written in the early Islamic historical tradition, it is an important source for studying the political and administrative development of the early Muslim world. This edition is presented in Arabic.'
  },


  // ═══════════════════════════════════════
  // FATWA
  // ═══════════════════════════════════════
 
  {
    id: 'fa1',
    title: 'Fatawa Ibn Taymiyyah',
    arabicTitle: 'فتاوى ابن تيمية',
    author: 'Ibn Taymiyyah',
    language: 'Arabic',
    size: '32 MB',
    categoryId: 'fatwa',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Fatawa Ibn Taymiyyah is a large body of legal and theological responses attributed to the influential scholar Ahmad ibn Abd al-Halim Ibn Taymiyyah. The collected material addresses a wide range of questions concerning Islamic belief, worship, jurisprudence, ethics, social matters and other aspects of religious life. The fatawa reflect Ibn Taymiyyah’s approach to interpreting the Quran, Sunnah and earlier scholarly opinions. Because the material covers many subjects and was compiled from a broader body of writings and responses, individual rulings should be studied within their original context and alongside the relevant sources and scholarly discussion.'
  },

  {
    id: 'fa2',
    title: "Fatawa al-Lajnah ad-Da'imah",
    arabicTitle: 'فتاوى اللجنة الدائمة',
    author: 'Permanent Committee for Scholarly Research and Ifta',
    language: 'Arabic',
    size: '28 MB',
    categoryId: 'fatwa',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      "Fatawa al-Lajnah ad-Da'imah is a collection of religious rulings issued by the Permanent Committee for Scholarly Research and Ifta in Saudi Arabia. The collection addresses questions covering Islamic belief, worship, jurisprudence, family matters, transactions, manners and various contemporary issues. The responses present the committee's considered positions based primarily on the Quran, Prophetic Sunnah and established Islamic scholarship. As an institutional collection of contemporary fatawa, it provides insight into the legal and theological positions issued by the committee on a wide range of questions."
  },

  {
    id: 'fa3',
    title: 'Fatawa Arkan ul-Islam',
    arabicTitle: 'فتاوى أركان الإسلام',
    author: 'Sheikh Muhammad ibn Salih al-Uthaymeen',
    language: 'English',
    size: '8 MB',
    categoryId: 'fatwa',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Fatawa Arkan ul-Islam is a collection of questions and answers by Sheikh Muhammad ibn Salih al-Uthaymeen concerning the fundamental practices of Islam. The work covers subjects related to the testimony of faith, prayer, zakat, fasting and pilgrimage, together with related questions about worship and everyday religious practice. The answers present Ibn Uthaymeen’s explanations and legal positions with reference to the Quran, Sunnah and principles of Islamic jurisprudence. It provides readers with a focused introduction to his approach to questions concerning the major acts of worship.'
  },

  {
    id: 'fa4',
    title: 'Contemporary Legal Rulings',
    arabicTitle: '',
    author: 'Sheikh Muhammad ibn Salih al-Uthaymeen',
    language: 'English',
    size: '10 MB',
    categoryId: 'fatwa',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Contemporary Legal Rulings is presented as a collection of answers and legal discussions by Sheikh Muhammad ibn Salih al-Uthaymeen concerning questions arising in Muslim life. The work addresses practical religious issues and contemporary circumstances through the author’s interpretation of the Quran, Sunnah and principles of Islamic jurisprudence. It provides insight into his approach to applying classical Islamic legal principles to questions encountered by Muslims in everyday life.'
  },


  // ═══════════════════════════════════════
  // CHILDREN'S BOOKS
  // ═══════════════════════════════════════
 
  {
    id: 'k1',
    title: 'My First Quran Storybook',
    arabicTitle: '',
    author: 'Saniyasnain Khan',
    language: 'English',
    size: '5 MB',
    categoryId: 'kids',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'My First Quran Storybook introduces children to selected stories and teachings from the Quran through simple, accessible storytelling. Written for young readers, the book presents important Quranic narratives in a child-friendly format intended to encourage curiosity about the Quran and help children become familiar with its stories, prophets and moral lessons.'
  },

  {
    id: 'k2',
    title: 'Tell Me About: The Prophet Muhammad',
    arabicTitle: '',
    author: 'Saniyasnain Khan',
    language: 'English',
    size: '4 MB',
    categoryId: 'kids',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Tell Me About: The Prophet Muhammad introduces children to the life and character of Prophet Muhammad ﷺ through simple explanations and engaging storytelling. The book presents key events from his life while highlighting qualities such as kindness, honesty, patience and compassion, helping young readers develop an age-appropriate understanding of the Prophet’s example.'
  },

  {
    id: 'k3',
    title: 'Goodnight Stories from the Quran',
    arabicTitle: '',
    author: 'Saniyasnain Khan',
    language: 'English',
    size: '6 MB',
    categoryId: 'kids',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Goodnight Stories from the Quran presents selected Quranic stories in a format designed for children and family reading. The stories introduce young readers to prophets, communities and important events mentioned in the Quran while drawing attention to the moral and spiritual lessons within them. Its accessible storytelling format makes it suitable for quiet reading and bedtime learning.'
  },

  {
    id: 'k4',
    title: 'The Greatest Stories from the Quran',
    arabicTitle: '',
    author: 'Saniyasnain Khan',
    language: 'English',
    size: '7 MB',
    categoryId: 'kids',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'The Greatest Stories from the Quran presents selected stories from the Quran for young readers in an accessible and engaging format. The collection introduces children to important prophets, people and events mentioned in the Quran while emphasizing faith, patience, obedience, courage and other moral lessons. It is designed to help children develop familiarity with Quranic narratives in a way that is approachable for their age.'
  },


  // ═══════════════════════════════════════
  // ISLAMIC ETHICS
  // ═══════════════════════════════════════
  
  {
    id: 'e1',
    title: 'The Ethics of Disagreement',
    arabicTitle: '',
    author: 'Taha Jabir Alalwani',
    language: 'English',
    size: '5 MB',
    categoryId: 'ethics',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'The Ethics of Disagreement explores the principles and manners that should guide Muslims when they differ in matters of understanding, interpretation and opinion. Drawing on Islamic intellectual and scholarly traditions, the work emphasizes respectful dialogue, intellectual responsibility, mutual understanding and the importance of maintaining unity despite legitimate differences. It provides a framework for approaching disagreement as an opportunity for constructive discussion rather than conflict.'
  },

  {
    id: 'e2',
    title: 'Purification of the Heart',
    arabicTitle: '',
    author: 'Hamza Yusuf',
    language: 'English',
    size: '8 MB',
    categoryId: 'ethics',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Purification of the Heart explores spiritual and ethical development in Islam, focusing on the inner qualities that shape a person’s character and relationship with Allah. The work discusses spiritual diseases such as envy, arrogance, anger and excessive attachment to worldly matters, while presenting principles for developing sincerity, gratitude, patience and other virtues. It encourages readers to approach Islamic practice not only through outward actions but also through the cultivation of the heart.'
  },

  {
    id: 'e3',
    title: 'Inner Dimensions of Islamic Worship',
    arabicTitle: '',
    author: 'Imam al-Ghazali',
    language: 'English',
    size: '6 MB',
    categoryId: 'ethics',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Inner Dimensions of Islamic Worship presents Imam al-Ghazali’s reflections on the spiritual meanings behind acts of worship. Rather than focusing only on outward actions, the work explores the intentions, awareness and inner states that give worship its deeper significance. It examines how practices such as prayer, fasting, charity and pilgrimage can contribute to spiritual refinement and the development of a stronger relationship with Allah.'
  },

  {
    id: 'e4',
    title: 'The Book of Assistance',
    arabicTitle: 'كتاب الإرشاد',
    author: 'Imam al-Haddad',
    language: 'English',
    size: '5 MB',
    categoryId: 'ethics',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'The Book of Assistance is a concise guide to Islamic spiritual practice and personal development by Imam Abdallah al-Haddad. The work offers practical guidance concerning worship, remembrance of Allah, repentance, sincerity, good character and the daily conduct of a Muslim. Its emphasis is on developing consistent religious practice and cultivating an inward awareness of Allah alongside outward acts of worship.'
  },

  {
    id: 'e5',
    title: 'Revival of Religious Sciences',
    arabicTitle: 'إحياء علوم الدين',
    author: 'Imam al-Ghazali',
    language: 'Arabic',
    size: '55 MB',
    categoryId: 'ethics',
    sourceUrl: '',
    pages: 0,
    parts: 1,
    about:
      'Revival of Religious Sciences (Ihya Ulum al-Din) is one of Imam al-Ghazali’s most influential works on Islamic spirituality, worship and ethical development. The extensive work examines religious knowledge and practice alongside the purification of the heart, covering subjects such as worship, social conduct, spiritual diseases, virtues and the remembrance of Allah. Its central aim is to connect outward religious practice with inner spiritual transformation. This edition is presented in Arabic.'
  },
];


// ============================================
// HELPERS
// ============================================

/** Find a single book by id */
export function getBookById(id: string): LibraryBook | undefined {
  return BOOKS.find((b) => b.id === id);
}

/** Get all books for a category */
export function getBooksByCategory(categoryId: string): LibraryBook[] {
  return BOOKS.filter((b) => b.categoryId === categoryId);
}
