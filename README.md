# Deen Companion

> **A premium Islamic knowledge and daily-practice companion for Quran,
> Hadith, prayer, duas, and Islamic reference material.**

**Project status:** MVP / Prototype\
**Current documentation target:** Product documentation\
**Source snapshot analyzed:** September 5, 2026

------------------------------------------------------------------------

## Overview

Deen Companion is a React Native / Expo application designed to bring
frequently used Islamic resources into one focused mobile experience.

The current MVP combines:

-   Quran reading and search
-   Hadith collections, books, chapters, readers, and search
-   Daily prayer times and prayer calendars
-   Verse of the Day and Hadith of the Day
-   Continue Reading progress
-   Quran, Hadith, Dua, and Library bookmarks
-   Islamic duas
-   Tasbih / dhikr counter
-   Islamic / Hijri calendar
-   99 Names of Allah
-   Islamic book library
-   Language and reading preferences
-   Profile and application settings
-   A centralized feature hub

The application is intentionally structured around **reference +
discovery + daily practice** rather than being only a Quran reader or
only a prayer application.

This README documents the implementation visible in the uploaded source
snapshot. It deliberately distinguishes working MVP functionality from
screens that are currently placeholders or still under development.

------------------------------------------------------------------------

## Product Structure

The main application is organized into five primary tabs:

  -----------------------------------------------------------------------
  Tab                                 Purpose
  ----------------------------------- -----------------------------------
  **Home**                            Daily content, prayer snapshot,
                                      continue reading, quick actions

  **Quran**                           Browse and read the Quran

  **Hadith**                          Browse Hadith collections and
                                      search Hadith

  **Library**                         Browse Islamic books and external
                                      reading sources

  **Prayer**                          Daily prayer times and prayer
                                      calendar
  -----------------------------------------------------------------------

Additional stack screens provide readers, search results, bookmarks,
settings, and utility tools.

### Product navigation at a glance

``` text
Splash
  ↓
Onboarding
  ↓
Main Application
  ├── Home
  ├── Quran
  │    ├── Surah
  │    ├── Juz
  │    ├── Page
  │    ├── Ayah Reader
  │    ├── Mushaf Reader
  │    └── Quran Search
  │
  ├── Hadith
  │    ├── Collection
  │    ├── Book
  │    ├── Chapter
  │    ├── Hadith Reader
  │    └── Hadith Search
  │
  ├── Library
  │    ├── Category
  │    ├── Book Details
  │    └── Book Reader
  │
  └── Prayer
       ├── Prayer Times
       ├── Prayer Settings
       └── Monthly Prayer Calendar

Utilities
  ├── Duas
  ├── Tasbih
  ├── Islamic Calendar
  ├── 99 Names of Allah
  ├── Zakat Calculator
  ├── Search
  ├── Bookmarks
  └── Settings
```

------------------------------------------------------------------------

# Core Features

## 1. Home

The Home screen acts as the user's daily starting point.

### Implemented

-   Prayer overview
-   Current prayer state
-   Next prayer information
-   Verse of the Day
-   Hadith of the Day
-   Continue Reading
-   Quick actions
-   Central search entry point
-   Feature hub

### Verse of the Day

The app derives a daily Quran verse from the day of the year and the
Quran's total ayah count.

The selected verse is stored locally by date so the same daily verse can
be reused during the day without repeatedly fetching it.

The Home service also supports a random verse action that replaces the
current daily verse for that date.

### Hadith of the Day

The MVP currently derives a daily Hadith from the Bukhari collection and
stores it locally by date.

A random Hadith action can also replace the current daily Hadith.

### Continue Reading

Quran reading progress is persisted locally and contains:

-   Surah number
-   Surah name
-   Ayah number
-   Progress percentage
-   Last-read timestamp

This allows the Home screen to act as a resume point for Quran reading.

------------------------------------------------------------------------

# 2. Quran

The Quran module is one of the most developed parts of the MVP.

## Quran browsing modes

The Quran tab supports:

-   Surah browsing
-   Juz browsing
-   Page browsing

The Quran contains **604 Mushaf pages** according to the application's
page constants.

## Quran reader

The reader supports multiple contexts:

### Surah context

-   Opens in Ayah-by-Ayah mode
-   Can switch to Mushaf-style page grouping

### Juz context

-   Opens in Mushaf mode
-   Can switch to Ayah-by-Ayah mode

### Page context

-   Opens directly into a specific page
-   Remains in page mode

The reader also supports navigation parameters for jumping directly to a
target page or ayah, which is used by bookmark navigation.

## Ayah Reader

The Ayah Reader provides:

-   Arabic Quran text
-   Translation
-   Ayah-by-ayah presentation
-   Adjustable Arabic font size
-   Adjustable translation font size
-   Ayah actions
-   Bookmarking
-   Copying text to the clipboard
-   Reading progress tracking

## Mushaf Reader

The Mushaf reader groups ayahs into page-based cards and displays:

-   Juz number
-   Mushaf page number
-   Surah transitions
-   Bismillah where applicable
-   Arabic text
-   Ayah markers
-   Page actions

Pages can be tapped for page-level actions and bookmark operations.

## Page Reader

The Page Reader renders a single Quran page fetched from the page
endpoint and provides the same page-oriented interaction model.

## Quran translations

The current language service maps:

-   English → `en.sahih`
-   Urdu → `ur.maududi`

The Arabic Quran text is fetched separately using the Uthmani edition.

## Quran search

Quran search is connected to the Al Quran Cloud search API.

Current filters include:

-   All
-   Arabic
-   Translation
-   Surah

Search results can be enriched with the corresponding Arabic or
translation text.

To reduce excessive API traffic, result enrichment is performed in
controlled batches and limits the number of unique Surahs requiring
additional requests.

------------------------------------------------------------------------

# 3. Hadith

The Hadith module supports collection-based browsing as well as a
separate search experience.

## Collections

The source currently defines metadata for seven Hadith collections:

-   Sahih al-Bukhari
-   Sahih Muslim
-   Sunan Abu Dawud
-   Jami' at-Tirmidhi
-   Sunan an-Nasa'i
-   Sunan Ibn Majah
-   Muwatta Malik

The main browsing UI exposes the major six collections through
collection filters, while the service layer contains metadata for all
seven.

## Browsing hierarchy

The navigation model is:

``` text
Collection
   ↓
Book / Section
   ↓
Chapter / Subchapter
   ↓
Hadith
```

The Hadith service obtains collection metadata from the Hadith API and
builds application-level book objects from the API's section metadata.

## Hadith reader

The reader provides:

-   Arabic text
-   Selected translation
-   Narrator extraction
-   Hadith number
-   Book information
-   Collection information
-   Grade information
-   Bookmarking
-   Reader settings

For Bukhari and Muslim, the service treats the collection as Sahih when
the upstream API does not provide a grade entry.

## Hadith language support

The language service currently maps:

-   English → `eng`
-   Urdu → `urd`

Arabic is displayed separately from the selected translation.

------------------------------------------------------------------------

# 4. Hadith Search Engine

Hadith search is backed by a **Supabase Edge Function** rather than
performing the full search directly inside the mobile application.

The mobile client sends:

``` text
query
collections
page
```

to the `search-hadith` Edge Function.

The response model supports:

-   Search results
-   Total result count
-   Pagination
-   `has_more`
-   Current page

Each search result contains:

-   Collection
-   Book number
-   Hadith number
-   English text
-   Arabic text
-   Urdu text
-   Semantic similarity score
-   Keyword score
-   Hybrid score

This indicates that the search backend is designed around a **hybrid
retrieval model**, combining semantic relevance with keyword relevance.

## Search filters

The current Hadith search UI supports:

### Scope

-   All
-   Arabic
-   Translation

### Collections

-   Bukhari
-   Muslim
-   Nasa'i
-   Abu Dawud
-   Tirmidhi
-   Ibn Majah

## Search result handling

The UI:

-   highlights matching terms
-   displays Arabic when available
-   selects English or Urdu translation based on the app language
-   exposes semantic/keyword relevance internally
-   supports pagination
-   falls back to keyword-only results when semantic search is
    unavailable

The search UI also contains English stop-word handling and lightweight
stemming for highlighting.

------------------------------------------------------------------------

# 5. Prayer

Prayer functionality is backed by the Aladhan API.

## Daily prayer times

The application can request prayer timings by:

-   City
-   Country
-   Calculation method

It also contains coordinate-based timing support in the service layer.

The prayer service normalizes API timing information into
application-level prayer objects.

The main prayer sequence includes:

-   Fajr
-   Sunrise
-   Dhuhr
-   Asr
-   Maghrib
-   Isha

## Prayer state

The application calculates prayer state information such as:

-   Past prayer
-   Current / next prayer
-   Upcoming prayer
-   Countdown
-   Progress percentage

The Home and Prayer screens use this state to provide a more contextual
daily prayer experience rather than displaying only static times.

## Prayer settings

Persisted settings include:

-   City
-   Country
-   Calculation method
-   School
-   Notifications enabled
-   12/24-hour display preference
-   Arabic font size
-   Translation font size

The current service defaults include:

-   City: Wah
-   Country: Pakistan
-   Calculation method: 1
-   12-hour display
-   Notifications enabled

The prayer API requests currently use the application's configured
mathematical calendar approach and a fixed school parameter in the
service implementation.

## Monthly prayer calendar

The application can retrieve an entire month of prayer data and displays
it in a calendar-oriented interface.

------------------------------------------------------------------------

# 6. Islamic / Hijri Calendar

The Islamic Calendar screen is separate from the prayer calendar.

It uses the Aladhan calendar API and currently relies on the
`hToGCalendar` endpoint for Hijri/Gregorian date mapping.

The implementation includes:

-   Hijri month navigation
-   Gregorian date mapping
-   Calendar grid generation
-   Current-day highlighting
-   Islamic events
-   Upcoming events
-   Gregorian and Hijri date presentation

The calendar code also normalizes different possible API response shapes
before converting them into the app's calendar model.

------------------------------------------------------------------------

# 7. Duas

The Dua module is currently implemented as local application data rather
than a remote API.

Duas are organized into categories such as:

-   Morning & Evening
-   Before Sleeping
-   Travel
-   Eating & Drinking
-   Prayer
-   Protection
-   Forgiveness
-   Family
-   Difficult Times

Each Dua can contain:

-   Arabic
-   Transliteration
-   Translation
-   Source

Sources in the current dataset include Quran and recognized Hadith
collections.

Duas can be bookmarked and accessed from the dedicated Dua bookmarks
screen.

------------------------------------------------------------------------

# 8. Tasbih

The Tasbih screen provides a digital dhikr counter.

### Implemented functionality

-   Tap-to-count
-   Circular progress indicator
-   Dhikr selection
-   Reset
-   Change Dhikr
-   Vibration toggle
-   History
-   Daily goal tracking
-   Persistent state

The current Tasbih state is stored in AsyncStorage.

------------------------------------------------------------------------

# 9. 99 Names of Allah

The Names of Allah screen contains the Asma ul-Husna dataset with:

-   Number
-   Arabic name
-   Transliteration
-   English meaning

The screen also provides local search by name or meaning.

------------------------------------------------------------------------

# 10. Islamic Library

The Library is a curated collection of Islamic books grouped by
category.

Current categories include:

-   Hadith
-   Fiqh
-   Aqeedah
-   Seerah
-   Islamic History
-   Fatwa
-   Children's Books
-   Islamic Ethics

The current source snapshot contains **18 configured books**.

Books have application metadata such as:

-   Title
-   Arabic title
-   Author
-   Language
-   Size
-   Category
-   Number of pages
-   Number of parts
-   Description
-   External source URL

## Library navigation

``` text
Library
  ↓
Category
  ↓
Book Details
  ↓
Book Reader / External Source
```

The Library also supports bookmarking.

------------------------------------------------------------------------

# 11. Bookmarks

Bookmarks are centralized through `bookmarkService`.

The service deliberately keeps UI components from accessing AsyncStorage
directly.

Supported bookmark categories include:

-   Quran ayahs
-   Quran positions
-   Hadith
-   Duas
-   Library books

## Quran bookmarks

Quran bookmarks store information such as:

-   Surah
-   Ayah
-   Arabic text
-   Global ayah number
-   Page
-   Juz
-   Saved date

The reader can also bookmark a reading position at page/Juz level.

## Hadith bookmarks

Hadith bookmarks preserve the Hadith object plus a save timestamp.

## Library bookmarks

Library bookmarks store:

-   Book ID
-   Title
-   Author
-   Category
-   Saved timestamp

------------------------------------------------------------------------

# 12. Search

Search has a central entry screen and dedicated result screens.

The current architecture separates:

``` text
Global Search
   ├── Quran Search
   └── Hadith Search
```

Quran and Hadith search therefore have different retrieval
implementations while sharing a common product entry point.

------------------------------------------------------------------------

# 13. Personalization

## Language

Language is managed through a centralized `languageService`.

The service:

1.  Loads the selected language from AsyncStorage.
2.  Keeps the active language in memory.
3.  Persists changes.
4.  Notifies registered services to clear language-dependent caches.
5.  Determines which Quran and Hadith editions should be requested.

### Currently exposed languages

-   English
-   Urdu

Additional languages are structurally planned in the language settings
screen but are commented out and are not currently connected to
translation editions.

## Font settings

The application supports independent font sizes for:

-   Arabic
-   Translation

Current configured ranges:

  Text                          Range   Default
  -------------------------- -------- ---------
  Arabic                       16--40        22
  Translation                  12--28        14
  Urdu translation default        ---        15

These values are persisted locally.

------------------------------------------------------------------------

# 14. Settings & Profile

The settings area currently includes access to:

-   Edit Profile
-   Language
-   Font settings
-   Prayer settings
-   Notifications
-   About

The profile model currently stores:

-   Name
-   Email
-   Phone

Profile information is persisted locally.

The profile avatar is currently represented by an initial. Image-picker
functionality is marked as TODO.

------------------------------------------------------------------------

# Architecture

The application uses a relatively clean separation between screens,
reusable components, services, hooks, constants, and types.

``` text
src/
├── app/
│   ├── (tabs)/
│   ├── bookmarks/
│   └── search/
│
├── components/
│   ├── hadith/
│   ├── home/
│   ├── illustrations/
│   ├── library/
│   ├── prayer/
│   ├── quran/
│   └── reader/
│
├── constants/
│   ├── cities.ts
│   ├── hadith.ts
│   ├── library.ts
│   ├── quran.ts
│   └── theme.ts
│
├── hooks/
│   ├── useFontSizes.ts
│   └── useReaderData.ts
│
├── services/
│   ├── bookmarkService.ts
│   ├── hadithService.ts
│   ├── homeService.ts
│   ├── languageService.ts
│   ├── prayerService.ts
│   ├── quranService.ts
│   └── settingsService.ts
│
└── types/
    ├── bookmark.ts
    ├── hadith.ts
    ├── library.ts
    ├── prayer.ts
    └── quran.ts
```

------------------------------------------------------------------------

# Service Layer

## `quranService`

Responsible for:

-   Quran API requests
-   Surah retrieval
-   Juz retrieval
-   Page retrieval
-   Quran search
-   Arabic text retrieval
-   Translation retrieval
-   Individual ayah retrieval
-   In-memory caching
-   Retry handling

The service uses Al Quran Cloud as its upstream Quran data provider.

## `hadithService`

Responsible for:

-   Collection metadata
-   Collection details
-   Book/section metadata
-   Book Hadith retrieval
-   Individual Hadith retrieval
-   Arabic + translation merging
-   Hadith grade normalization
-   Hadith search requests
-   Multi-layer request caching

## `prayerService`

Responsible for:

-   City-based prayer timings
-   Coordinate-based prayer timings
-   Monthly prayer calendars
-   Prayer state calculation
-   Time parsing and formatting
-   Timezone-aware date handling

## `homeService`

Responsible for:

-   Verse of the Day
-   Hadith of the Day
-   Random daily content
-   Continue Reading
-   Daily cache management

## `bookmarkService`

Responsible for all local bookmark persistence.

## `settingsService`

Responsible for:

-   Prayer settings
-   Arabic font size
-   Translation font size
-   Default font values

## `languageService`

Acts as the application's central language state.

It also coordinates cache invalidation when the language changes.

------------------------------------------------------------------------

# Caching Strategy

Caching is an important part of the current MVP because Quran and Hadith
data are remote resources.

## Quran

The Quran service maintains an in-memory cache keyed by request URL.

The service also includes retry handling for failed requests.

## Hadith

The Hadith service has three layers:

``` text
Request
  ↓
Raw JSON Cache
  ↓
In-flight Request Deduplication
  ↓
Transformed Result Cache
```

There is also a dedicated session-level cache for the global
`info.min.json` metadata response.

### Why this matters

If several screens request the same Hadith resource at the same time,
the application can reuse an existing request instead of starting
multiple network calls.

Likewise, expensive transformations such as mapping and filtering Hadith
objects are cached during the session.

## Language-aware cache invalidation

The language service maintains a cache-clearer registry.

When the user changes language:

``` text
setLanguage()
   ↓
Persist language
   ↓
Update in-memory language
   ↓
Clear registered caches
   ↓
Future API requests use the new edition
```

This prevents English content from remaining in service caches after
switching to Urdu.

## Local persistence

AsyncStorage is used for user-specific and daily state such as:

-   Language
-   Prayer settings
-   Font settings
-   Quran bookmarks
-   Quran positions
-   Hadith bookmarks
-   Dua bookmarks
-   Library bookmarks
-   Reading progress
-   Verse of the Day
-   Hadith of the Day
-   Tasbih state/history
-   Local profile

------------------------------------------------------------------------

# External Data Sources

The current MVP uses the following external sources.

## Quran

**Al Quran Cloud API**

Used for:

-   Surah metadata
-   Arabic Quran
-   Translations
-   Juz
-   Page data
-   Quran search
-   Individual ayah retrieval

API base used by the application:

``` text
https://api.alquran.cloud/v1
```

## Prayer & Calendar

**Aladhan API**

Used for:

-   Prayer timings
-   Monthly prayer calendars
-   Hijri/Gregorian calendar conversion

API base:

``` text
https://api.aladhan.com/v1
```

## Hadith

**fawazahmed0/hadith-api**

Used for:

-   Hadith collection metadata
-   Collection sections
-   English/Urdu editions
-   Arabic editions
-   Individual Hadith
-   Section-level Hadith data

Base:

``` text
https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1
```

## Hadith Search

**Supabase Edge Function**

The mobile application sends Hadith search requests to the project's
`search-hadith` Edge Function.

The search backend returns hybrid search scores and paginated results.

------------------------------------------------------------------------

# UI & Design System

The source contains a centralized design system in `constants/theme.ts`.

## Core palette

  Token             Value
  ----------------- -----------
  Primary           `#0F6B50`
  Secondary         `#102A43`
  Accent            `#D4AF37`
  Background        `#F8F6F0`
  Dark background   `#101A17`

The visual direction combines:

-   Deep emerald
-   Dark navy
-   Warm gold
-   Warm off-white
-   Islamic geometric visual language

## Typography

The source integrates:

-   Inter for UI text
-   Poppins for headings
-   Amiri for Arabic/Urdu-facing typography

The theme also defines centralized:

-   Font sizes
-   Spacing
-   Border radii
-   Light/dark color tokens

------------------------------------------------------------------------

# Navigation

Navigation is implemented with **Expo Router**.

The root stack contains:

-   Splash
-   Onboarding
-   Main tabs
-   Quran reader
-   Hadith collection/book/chapter/reader screens
-   Prayer calendar
-   Prayer settings
-   Features
-   Duas
-   Tasbih
-   Zakat Calculator
-   Islamic Calendar
-   Names of Allah
-   Library routes
-   Bookmarks
-   Search
-   Settings
-   About
-   Language settings
-   Font settings
-   Notifications

The bottom navigation contains five tabs:

``` text
Home | Quran | Hadith | Library | Prayer
```

------------------------------------------------------------------------

# Current MVP Status

The current source snapshot should be considered an **MVP / prototype**,
not a finished production release.

## Strongly implemented

-   Home dashboard
-   Quran browsing
-   Quran reader
-   Quran bookmarks
-   Quran search
-   Hadith collection browsing
-   Hadith reader
-   Hadith bookmarks
-   Hadith search
-   Prayer times
-   Prayer calendar
-   Islamic calendar
-   Dua collection
-   Dua bookmarks
-   Tasbih
-   Names of Allah
-   Library browsing
-   Library bookmarks
-   Language settings
-   Font settings
-   Local profile
-   Continue Reading
-   Daily Quran/Hadith content

## Partially implemented / prototype-level

### Notifications

The Notifications screen is currently a **coming-soon placeholder**.

The intended feature set includes prayer reminders and other
notification functionality, but the source snapshot does not contain a
completed notification system.

### Zakat Calculator

The Zakat Calculator route currently displays a **Coming Soon** state.

The actual calculation engine is not implemented yet.

### Profile image

The Edit Profile screen has a TODO for image-picker functionality.

### Additional languages

The language architecture is prepared for expansion, but only English
and Urdu currently have active Quran/Hadith edition mappings.

### Dark mode

The theme file contains dark-theme tokens, but the current
navigation/screens do not show a complete application-wide dark-mode
implementation.

### Authentication / cloud user accounts

The uploaded source snapshot uses local AsyncStorage for profile and
bookmark persistence. No complete user authentication or cloud
synchronization layer is visible in the uploaded source.

------------------------------------------------------------------------

# Important Security Note

The current `hadithService.ts` source contains the Supabase project URL
and an anonymous client key directly in the application source.

A Supabase anonymous/public key is designed to be exposed to clients
when Row Level Security and backend authorization are correctly
configured. However, hardcoding service configuration makes future
environment management harder and should be cleaned up before a
production release.

For the production version, prefer:

``` text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

or the equivalent Expo environment configuration.

Never place a Supabase service-role key, database password, private API
secret, or other privileged credential inside the mobile application.

------------------------------------------------------------------------

# Development Considerations

Because the uploaded archive contains the `src/` source tree rather than
the complete project root, the following project-level files were not
available for this analysis:

-   `package.json`
-   Expo configuration
-   EAS configuration
-   TypeScript configuration
-   Babel/Metro configuration
-   Native project configuration
-   Environment files

Therefore, exact dependency versions and the definitive
installation/build commands should be taken from the actual project root
rather than inferred from this README.

The source does, however, clearly indicate dependencies including:

-   Expo Router
-   React Native
-   React Native SVG
-   AsyncStorage
-   Expo Clipboard
-   Expo Splash Screen
-   Expo Status Bar
-   React Native WebView
-   Expo Google Fonts
-   Safe Area Context
-   React Native Gesture Handler
-   React Native Reanimated

------------------------------------------------------------------------

# Suggested Project-Level Environment

For a complete project checkout, environment configuration should
eventually centralize remote service settings.

A production-oriented configuration could conceptually contain:

``` env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Do not commit private credentials.

------------------------------------------------------------------------

# Data Flow

## Quran

``` text
Quran Screen
    ↓
quranService
    ↓
In-memory cache
    ↓
Al Quran Cloud API
    ↓
Transform API response
    ↓
Typed Quran models
    ↓
Reader / Search UI
```

## Hadith browsing

``` text
Hadith Screen
    ↓
hadithService
    ↓
info.min.json
    ↓
Collection / Book metadata
    ↓
Section API
    ↓
Arabic + Translation merge
    ↓
Hadith UI
```

## Hadith search

``` text
Search UI
    ↓
hadithService.searchHadiths()
    ↓
Supabase Edge Function
    ↓
Hybrid retrieval
    ├── semantic score
    └── keyword score
    ↓
hybrid score
    ↓
Paginated results
    ↓
Search UI
```

## Prayer

``` text
Prayer Screen
    ↓
prayerService
    ↓
Aladhan API
    ↓
Timing normalization
    ↓
Prayer state calculation
    ↓
Current / Next / Upcoming UI
```

## Local personalization

``` text
Settings / Reader / Bookmark
          ↓
      Service Layer
          ↓
      AsyncStorage
          ↓
      Local App State
```

------------------------------------------------------------------------

# Design Principles

The current source reflects several clear product principles.

## 1. Reference first

Quran and Hadith are treated as primary knowledge sources.

## 2. Daily utility

Prayer times, daily Quran/Hadith content, Tasbih, and Continue Reading
encourage repeated use.

## 3. Low-friction discovery

Search and the centralized Features screen make secondary tools
accessible without overloading the main tab bar.

## 4. Personal reading experience

Font sizing, language selection, bookmarks, and reading progress allow
the user to shape their reading experience.

## 5. Service abstraction

Screens generally consume application services rather than directly
owning API communication.

This makes it easier to change upstream providers later.

------------------------------------------------------------------------

# Future Expansion Areas

Based on the current product structure and existing placeholders, the
natural next development areas are:

1.  Complete prayer notifications and reminders.
2.  Implement the Zakat calculation engine.
3.  Add proper profile image selection.
4.  Expand language support beyond English and Urdu.
5.  Complete dark-mode behavior throughout the UI.
6.  Add authentication and cloud synchronization.
7.  Move service configuration to environment variables.
8.  Improve offline behavior for frequently accessed Quran/Hadith
    content.
9.  Add richer Hadith search controls and relevance tuning.
10. Add additional Islamic tools through the existing Features hub.
11. Add more books and richer local library metadata.
12. Add stronger content-source/version tracking for Islamic reference
    material.
13. Add automated tests around service transformations, caching, prayer
    calculations, and search response handling.
14. Add production monitoring and error reporting.
15. Add release/build configuration and CI/CD at the project root.

------------------------------------------------------------------------

# Recommended Production Readiness Checklist

Before treating the MVP as a production application, verify:

## Architecture

-   [ ] No hardcoded private credentials
-   [ ] Environment configuration added
-   [ ] API error handling standardized
-   [ ] Network timeout strategy added
-   [ ] Offline strategy defined
-   [ ] Centralized logging/error reporting

## Data

-   [ ] Quran source/version documented
-   [ ] Translation sources documented
-   [ ] Hadith source/version documented
-   [ ] Hadith grading behavior reviewed
-   [ ] Library source licensing verified
-   [ ] External book URLs verified

## Product

-   [ ] Notifications completed
-   [ ] Zakat Calculator completed
-   [ ] Profile image support completed
-   [ ] Additional languages either implemented or removed from UI
-   [ ] Dark mode completed or removed from public settings
-   [ ] Empty/error/loading states reviewed across every screen

## Security

-   [ ] Supabase RLS policies reviewed
-   [ ] Edge Function authorization reviewed
-   [ ] No service-role keys in client
-   [ ] Production environment variables configured
-   [ ] Sensitive logs removed

## Quality

-   [ ] Android tested
-   [ ] iOS tested
-   [ ] Small-screen layout tested
-   [ ] Large-screen layout tested
-   [ ] RTL Urdu behavior reviewed
-   [ ] Network failure scenarios tested
-   [ ] Language switching tested after cached content has already
    loaded
-   [ ] Large Quran/Hadith lists tested for memory/performance

------------------------------------------------------------------------

# Source Snapshot

The documentation above is based on the uploaded `src.zip` source
snapshot.

The snapshot contains approximately:

-   **97 source files**
-   Expo Router application routes
-   Reusable UI components
-   Service layer
-   Type definitions
-   Constants
-   Hooks

The archive contains the `src/` directory but not the complete project
root, so project configuration and package versions are intentionally
not documented as definitive here.

------------------------------------------------------------------------

# Conclusion

Deen Companion's current MVP already has the foundation of a broader
Islamic reference platform rather than a single-purpose religious
utility.

Its strongest architectural areas are:

-   Quran reading
-   Hadith browsing
-   Hybrid Hadith search
-   Prayer calculations
-   Local personalization
-   Bookmark management
-   Service-level caching
-   Language-aware data selection

The next stage is less about adding a large number of screens and more
about **hardening the existing foundation**: production configuration,
notifications, cloud persistence, offline behavior, search quality,
content provenance, testing, and release readiness.

> **Deen Companion --- Your companion for Quran, Hadith, prayer, and
> everyday Islamic knowledge.**
