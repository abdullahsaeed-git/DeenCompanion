import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { colors, alpha } from '../constants/theme';
import { BackIcon, NextIcon, PrevIcon, StarIcon } from '@/components/Icons';

// ============================================
// CONSTANTS
// ============================================

const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1';

const CALENDAR_METHOD = 'MATHEMATICAL';

const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  "Rabi' al-awwal",
  "Rabi' al-thani",
  'Jumada al-awwal',
  'Jumada al-thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

const HIJRI_MONTH_SHORT = [
  'Muh',
  'Saf',
  'Rabi I',
  'Rabi II',
  'Jum I',
  'Jum II',
  'Raj',
  'Sha',
  'Ram',
  'Shaw',
  'Dhu Q',
  'Dhu H',
];

const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

const WEEKDAY_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const GREG_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// ============================================
// TYPES
// ============================================

interface IslamicEvent {
  day: number;
  month: number;
  name: string;
}

interface CalendarDay {
  hijriDay: number;
  hijriMonth: number;
  hijriYear: number;

  gregorianDay: number;
  gregorianMonth: number;
  gregorianYear: number;

  weekday: string;

  isToday: boolean;
  isCurrentMonth: boolean;
  hasEvent: boolean;
}

// ============================================
// ISLAMIC EVENTS
// ============================================

const ISLAMIC_EVENTS: IslamicEvent[] = [
  {
    day: 1,
    month: 1,
    name: 'Islamic New Year',
  },
  {
    day: 10,
    month: 1,
    name: 'Day of Ashura',
  },
  {
    day: 12,
    month: 3,
    name: 'Mawlid an-Nabawi ﷺ',
  },
  {
    day: 27,
    month: 7,
    name: "Isra & Mi'raj",
  },
  {
    day: 1,
    month: 9,
    name: 'Ramadan begins',
  },
  {
    day: 27,
    month: 9,
    name: 'Laylat al-Qadr',
  },
  {
    day: 1,
    month: 10,
    name: 'Eid al-Fitr',
  },
  {
    day: 9,
    month: 12,
    name: 'Day of Arafah',
  },
  {
    day: 10,
    month: 12,
    name: 'Eid al-Adha',
  },
];

// ============================================
// API TYPES
// ============================================

interface HijriDate {
  day: string | number;
  month: {
    number: string | number;
    en?: string;
    ar?: string;
  };
  year: string | number;
}

interface GregorianDate {
  day: string | number;
  month: {
    number: string | number;
    en?: string;
  };
  year: string | number;
  weekday?: {
    en?: string;
    ar?: string;
  };
}

interface CalendarApiDay {
  date?: {
    hijri?: HijriDate;
    gregorian?: GregorianDate;
  };

  hijri?: HijriDate;
  gregorian?: GregorianDate;
}

// ============================================
// API
// ============================================

/**
 * Get the current Hijri date from a Gregorian date.
 *
 * This is only used to determine which Hijri month
 * should initially be displayed.
 */
async function fetchCurrentHijriDate(): Promise<{
  year: number;
  month: number;
  day: number;
}> {
  const today = new Date();

  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();

  const url =
    `${ALADHAN_BASE_URL}/gToH/${dd}-${mm}-${yyyy}` +
    `?calendarMethod=${CALENDAR_METHOD}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch current Hijri date (${response.status})`
    );
  }

  const json = await response.json();

  if (json.code !== 200 || !json.data?.hijri) {
    throw new Error(
      json.status || 'Failed to determine current Hijri date'
    );
  }

  const hijri = json.data.hijri;

  return {
    year: parseInt(String(hijri.year), 10),
    month: parseInt(String(hijri.month.number), 10),
    day: parseInt(String(hijri.day), 10),
  };
}

/**
 * Fetch an entire Hijri month.
 *
 * IMPORTANT:
 * This uses the Islamic Calendar API's
 * hToGCalendar endpoint rather than the old
 * prayer-times hijriCalendar endpoint.
 */
async function fetchHijriMonth(
  year: number,
  month: number
): Promise<CalendarApiDay[]> {
  const url =
    `${ALADHAN_BASE_URL}/hToGCalendar/${month}/${year}` +
    `?calendarMethod=${CALENDAR_METHOD}`;

  const response = await fetch(url);

  console.log("fetched with url: " , url);

  if (!response.ok) {
    throw new Error(
      `Failed to load Hijri calendar (${response.status})`
    );
  }

  const json = await response.json();

  if (json.code !== 200) {
    throw new Error(
      json.status || 'Failed to load Hijri calendar'
    );
  }

  if (!Array.isArray(json.data)) {
    throw new Error('Invalid calendar data returned by Aladhan');
  }

  return json.data;
}

// ============================================
// HELPERS
// ============================================

function getTodayGregorianString(): string {
  const today = new Date();

  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');
}

function getWeekdayIndex(name: string): number {
  const normalized = String(name || '').trim().toLowerCase();

  const exactIndex = WEEKDAY_FULL.findIndex(
    (day) => day.toLowerCase() === normalized
  );

  if (exactIndex >= 0) {
    return exactIndex;
  }

  return WEEKDAY_FULL.findIndex((day) =>
    day.toLowerCase().startsWith(normalized)
  );
}

/**
 * Normalizes the response shape from hToGCalendar.
 *
 * The calendar endpoint provides Gregorian and Hijri
 * date information. This helper supports both:
 *
 * {
 *   date: {
 *     gregorian: {...},
 *     hijri: {...}
 *   }
 * }
 *
 * and a direct:
 *
 * {
 *   gregorian: {...},
 *   hijri: {...}
 * }
 *
 * shape.
 */
function getDatesFromApiDay(apiDay: CalendarApiDay): {
  gregorian: GregorianDate;
  hijri: HijriDate;
} {
  const gregorian =
    apiDay.date?.gregorian ?? apiDay.gregorian;

  const hijri =
    apiDay.date?.hijri ?? apiDay.hijri;

  if (!gregorian || !hijri) {
    throw new Error('Invalid date received from Aladhan');
  }

  return {
    gregorian,
    hijri,
  };
}

function parseApiDay(
  apiDay: CalendarApiDay,
  isCurrentMonth: boolean,
  todayStr: string
): CalendarDay {
  const { gregorian: g, hijri: h } =
    getDatesFromApiDay(apiDay);

  const gregorianYear = parseInt(
    String(g.year),
    10
  );

  const gregorianMonth = parseInt(
    String(g.month.number),
    10
  );

  const gregorianDay = parseInt(
    String(g.day),
    10
  );

  const hijriYear = parseInt(
    String(h.year),
    10
  );

  const hijriMonth = parseInt(
    String(h.month.number),
    10
  );

  const hijriDay = parseInt(
    String(h.day),
    10
  );

  const dateStr =
    `${gregorianYear}-` +
    `${String(gregorianMonth).padStart(2, '0')}-` +
    `${String(gregorianDay).padStart(2, '0')}`;

  const hasEvent = ISLAMIC_EVENTS.some(
    (event) =>
      event.day === hijriDay &&
      event.month === hijriMonth
  );

  return {
    hijriDay,
    hijriMonth,
    hijriYear,

    gregorianDay,
    gregorianMonth,
    gregorianYear,

    weekday:
      g.weekday?.en ||
      new Date(
        gregorianYear,
        gregorianMonth - 1,
        gregorianDay
      ).toLocaleDateString('en-US', {
        weekday: 'long',
      }),

    isToday: dateStr === todayStr,
    isCurrentMonth,
    hasEvent,
  };
}

/**
 * Build the 6-row / 42-cell calendar grid.
 */
function buildCalendarGrid(
  prev: CalendarApiDay[],
  curr: CalendarApiDay[],
  next: CalendarApiDay[]
): CalendarDay[] {
  if (!curr.length) {
    return [];
  }

  const first = getDatesFromApiDay(curr[0]);

  const firstWeekdayName =
    first.gregorian.weekday?.en ||
    new Date(
      parseInt(String(first.gregorian.year), 10),
      parseInt(String(first.gregorian.month.number), 10) - 1,
      parseInt(String(first.gregorian.day), 10)
    ).toLocaleDateString('en-US', {
      weekday: 'long',
    });

  const firstWeekday =
    getWeekdayIndex(firstWeekdayName);

  const todayStr =
    getTodayGregorianString();

  const grid: CalendarDay[] = [];

  // --------------------------------------------
  // Previous month padding
  // --------------------------------------------

  const previousDaysNeeded =
    firstWeekday < 0 ? 0 : firstWeekday;

  const prevPadding =
    previousDaysNeeded > 0
      ? prev.slice(-previousDaysNeeded)
      : [];

  for (const day of prevPadding) {
    grid.push(
      parseApiDay(
        day,
        false,
        todayStr
      )
    );
  }

  // --------------------------------------------
  // Current month
  // --------------------------------------------

  for (const day of curr) {
    grid.push(
      parseApiDay(
        day,
        true,
        todayStr
      )
    );
  }

  // --------------------------------------------
  // Next month padding
  // --------------------------------------------

  const remaining =
    42 - grid.length;

  if (remaining > 0) {
    const nextPadding =
      next.slice(0, remaining);

    for (const day of nextPadding) {
      grid.push(
        parseApiDay(
          day,
          false,
          todayStr
        )
      );
    }
  }

  return grid;
}

function formatGregorianShort(
  apiDay: CalendarApiDay
): string {
  const { gregorian } =
    getDatesFromApiDay(apiDay);

  const day = parseInt(
    String(gregorian.day),
    10
  );

  const month = parseInt(
    String(gregorian.month.number),
    10
  );

  return `${day} ${GREG_MONTHS[month - 1]}`;
}

function getUpcomingEvents(
  currentMonth: number,
  _currentYear: number
) {
  const events: (
    IslamicEvent & {
      shortMonth: string;
    }
  )[] = [];

  for (let i = 0; i < 12; i++) {
    const month =
      ((currentMonth - 1 + i) % 12) + 1;

    const monthEvents =
      ISLAMIC_EVENTS.filter(
        (event) =>
          event.month === month
      );

    for (const event of monthEvents) {
      events.push({
        ...event,
        shortMonth:
          HIJRI_MONTH_SHORT[
            month - 1
          ],
      });
    }
  }

  return events.slice(0, 5);
}

// ============================================
// MAIN SCREEN
// ============================================

export default function IslamicCalendarScreen() {
  const insets =
    useSafeAreaInsets();

  /**
   * Start empty rather than hardcoding 1448/2.
   *
   * The actual current Hijri month is obtained
   * from gToH when the screen mounts.
   */
  const [hijriYear, setHijriYear] =
    useState<number | null>(null);

  const [hijriMonth, setHijriMonth] =
    useState<number | null>(null);

  const [days, setDays] =
    useState<CalendarDay[]>([]);

  const [monthName, setMonthName] =
    useState('');

  const [gregorianRange, setGregorianRange] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [initialReady, setInitialReady] =
    useState(false);

  // ==========================================
  // INITIAL HIJRI DATE
  // ==========================================

  useEffect(() => {
    let mounted = true;

    async function initializeCalendar() {
      try {
        setError(null);

        const current =
          await fetchCurrentHijriDate();

        if (!mounted) {
          return;
        }

        setHijriYear(current.year);
        setHijriMonth(current.month);
      } catch (err: any) {
        if (!mounted) {
          return;
        }

        setError(
          err?.message ||
            'Failed to determine current Hijri date'
        );
      } finally {
        if (mounted) {
          setInitialReady(true);
        }
      }
    }

    initializeCalendar();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================
  // LOAD SELECTED HIJRI MONTH
  // ==========================================

  const load = useCallback(async () => {
    if (
      hijriYear === null ||
      hijriMonth === null
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ----------------------------------------
      // Previous Hijri month
      // ----------------------------------------

      const prevMonth =
        hijriMonth === 1
          ? 12
          : hijriMonth - 1;

      const prevYear =
        hijriMonth === 1
          ? hijriYear - 1
          : hijriYear;

      // ----------------------------------------
      // Next Hijri month
      // ----------------------------------------

      const nextMonth =
        hijriMonth === 12
          ? 1
          : hijriMonth + 1;

      const nextYear =
        hijriMonth === 12
          ? hijriYear + 1
          : hijriYear;

      // ----------------------------------------
      // Fetch all 3 months
      // ----------------------------------------

      const [
        previousMonth,
        currentMonth,
        nextMonthData,
      ] = await Promise.all([
        fetchHijriMonth(
          prevYear,
          prevMonth
        ),

        fetchHijriMonth(
          hijriYear,
          hijriMonth
        ),

        fetchHijriMonth(
          nextYear,
          nextMonth
        ),
      ]);

      if (!currentMonth.length) {
        throw new Error(
          'No calendar days were returned for this Hijri month'
        );
      }

      // ----------------------------------------
      // Build calendar grid
      // ----------------------------------------

      const grid =
        buildCalendarGrid(
          previousMonth,
          currentMonth,
          nextMonthData
        );

      setDays(grid);

      // ----------------------------------------
      // Month title
      // ----------------------------------------

      setMonthName(
        `${HIJRI_MONTHS[hijriMonth - 1]} ${hijriYear} AH`
      );

      // ----------------------------------------
      // Gregorian range
      // ----------------------------------------

      const first =
        currentMonth[0];

      const last =
        currentMonth[
          currentMonth.length - 1
        ];

      setGregorianRange(
        `${formatGregorianShort(first)} – ${formatGregorianShort(last)}`
      );
    } catch (err: any) {
      setError(
        err?.message ||
          'Failed to load calendar'
      );
    } finally {
      setLoading(false);
    }
  }, [hijriYear, hijriMonth]);

  useEffect(() => {
    if (
      !initialReady ||
      hijriYear === null ||
      hijriMonth === null
    ) {
      return;
    }

    load();
  }, [
    initialReady,
    hijriYear,
    hijriMonth,
    load,
  ]);

  // ==========================================
  // NAVIGATION
  // ==========================================

  function goToPrevMonth() {
    if (
      hijriYear === null ||
      hijriMonth === null
    ) {
      return;
    }

    if (hijriMonth === 1) {
      setHijriMonth(12);
      setHijriYear(
        (year) => year - 1
      );
    } else {
      setHijriMonth(
        (month) => month - 1
      );
    }
  }

  function goToNextMonth() {
    if (
      hijriYear === null ||
      hijriMonth === null
    ) {
      return;
    }

    if (hijriMonth === 12) {
      setHijriMonth(1);
      setHijriYear(
        (year) => year + 1
      );
    } else {
      setHijriMonth(
        (month) => month + 1
      );
    }
  }

  const upcomingEvents =
    hijriMonth !== null
      ? getUpcomingEvents(
          hijriMonth,
          hijriYear ?? 0
        )
      : [];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 8,
            paddingBottom:
              insets.bottom + 34,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <BackIcon />
          </Pressable>

          <Text style={styles.title}>
            Islamic Calendar
          </Text>

          <View style={styles.spacer} />
        </View>

        {/* ================================== */}
        {/* MONTH SELECTOR */}
        {/* ================================== */}

        <View
          style={styles.monthSelector}
        >
          <Pressable
            style={styles.iconButton}
            onPress={goToPrevMonth}
            disabled={
              loading ||
              hijriMonth === null
            }
          >
            <PrevIcon />
          </Pressable>

          <View
            style={styles.monthNameBlock}
          >
            <Text
              style={styles.monthName}
            >
              {monthName ||
                'Loading…'}
            </Text>

            <Text
              style={styles.monthRange}
            >
              {gregorianRange}
            </Text>
          </View>

          <Pressable
            style={styles.iconButton}
            onPress={goToNextMonth}
            disabled={
              loading ||
              hijriMonth === null
            }
          >
            <NextIcon />
          </Pressable>
        </View>

        {/* ================================== */}
        {/* INITIAL / LOADING */}
        {/* ================================== */}

        {loading && (
          <View
            style={styles.centered}
          >
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text
              style={styles.loadingText}
            >
              Loading calendar…
            </Text>
          </View>
        )}

        {/* ================================== */}
        {/* ERROR */}
        {/* ================================== */}

        {error && !loading && (
          <View
            style={styles.centered}
          >
            <Text
              style={styles.errorText}
            >
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={load}
            >
              <Text
                style={styles.retryText}
              >
                Retry
              </Text>
            </Pressable>
          </View>
        )}

        {/* ================================== */}
        {/* CALENDAR */}
        {/* ================================== */}

        {!loading &&
          !error &&
          days.length > 0 && (
            <>
              {/* Weekday row */}

              <View
                style={styles.weekRow}
              >
                {WEEKDAYS.map(
                  (day) => (
                    <Text
                      key={day}
                      style={
                        styles.weekDay
                      }
                    >
                      {day}
                    </Text>
                  )
                )}
              </View>

              {/* Calendar grid */}

              <View
                style={styles.grid}
              >
                {days.map(
                  (day, index) => (
                    <View
                      key={`${day.gregorianYear}-${day.gregorianMonth}-${day.gregorianDay}-${index}`}
                      style={[
                        styles.cell,

                        !day.isCurrentMonth &&
                          styles.cellDim,

                        day.isToday &&
                          styles.cellToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.hijriDay,

                          !day.isCurrentMonth &&
                            styles.hijriDayDim,

                          day.isToday &&
                            styles.hijriDayToday,
                        ]}
                      >
                        {day.hijriDay}
                      </Text>

                      <Text
                        style={[
                          styles.gregDay,

                          !day.isCurrentMonth &&
                            styles.gregDayDim,

                          day.isToday &&
                            styles.gregDayToday,
                        ]}
                      >
                        {day.gregorianDay}
                      </Text>

                      {day.hasEvent && (
                        <View
                          style={
                            styles.eventDot
                          }
                        />
                      )}
                    </View>
                  )
                )}
              </View>

              {/* ================================= */}
              {/* UPCOMING EVENTS */}
              {/* ================================= */}

              <Text
                style={
                  styles.sectionLabel
                }
              >
                Upcoming
              </Text>

              <View
                style={styles.eventsList}
              >
                {upcomingEvents.map(
                  (event, index) => (
                    <View
                      key={`${event.month}-${event.day}-${index}`}
                      style={
                        styles.eventRow
                      }
                    >
                      <View
                        style={
                          styles.eventChip
                        }
                      >
                        <Text
                          style={
                            styles.eventChipDay
                          }
                        >
                          {event.day}
                        </Text>

                        <Text
                          style={
                            styles.eventChipMonth
                          }
                        >
                          {
                            event.shortMonth
                          }
                        </Text>
                      </View>

                      <View
                        style={
                          styles.eventTextBlock
                        }
                      >
                        <Text
                          style={
                            styles.eventName
                          }
                        >
                          {event.name}
                        </Text>

                        <Text
                          style={
                            styles.eventDate
                          }
                        >
                          {event.day}{' '}
                          {
                            HIJRI_MONTHS[
                              event.month - 1
                            ]
                          }
                        </Text>
                      </View>

                      <StarIcon
                        size={16}
                      />
                    </View>
                  )
                )}
              </View>
            </>
          )}
      </ScrollView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    gap: 10,
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 20,
    color: colors.secondary,
  },

  spacer: {
    width: 44,
  },

  // ==========================================
  // MONTH SELECTOR
  // ==========================================

  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },

  monthNameBlock: {
    alignItems: 'center',
    minWidth: 180,
  },

  monthName: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
  },

  monthRange: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },

  // ==========================================
  // LOADING / ERROR
  // ==========================================

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },

  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },

  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    paddingHorizontal: 24,
  },

  retryButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor:
      alpha(colors.primary, 0.09),
    borderRadius: 10,
  },

  retryText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // ==========================================
  // WEEKDAY ROW
  // ==========================================

  weekRow: {
    flexDirection: 'row',
    marginTop: 12,
  },

  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9.5,
    letterSpacing: 0.1,
    color: colors.textMuted,
    fontWeight: '600',
    paddingVertical: 6,
  },

  // ==========================================
  // CALENDAR GRID
  // ==========================================

  grid: {
    marginTop: 2,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius: 18,
    padding: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',

    shadowColor:
      alpha(colors.secondary, 0.05),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },

  cell: {
    width: `${100 / 7}%`,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },

  cellDim: {
    opacity: 0.45,
  },

  cellToday: {
    backgroundColor:
      colors.primary,

    shadowColor:
      alpha(colors.primary, 0.3),

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 4,
  },

  hijriDay: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.secondary,
    fontVariant: [
      'tabular-nums',
    ],
  },

  hijriDayDim: {
    color: colors.textDisabled,
  },

  hijriDayToday: {
    color: colors.surface,
  },

  gregDay: {
    fontSize: 9.5,
    color: colors.textMuted,
    fontWeight: '500',
  },

  gregDayDim: {
    color: colors.textDisabled,
  },

  gregDayToday: {
    color:
      alpha(colors.surface, 0.7),
  },

  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor:
      colors.accent,
    marginTop: 1,
  },

  // ==========================================
  // UPCOMING EVENTS
  // ==========================================

  sectionLabel: {
    marginTop: 16,
    marginHorizontal: 2,
    marginBottom: 8,
    fontSize: 10.5,
    letterSpacing: 0.12,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontWeight: '600',
  },

  eventsList: {
    gap: 10,
  },

  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,

    shadowColor:
      alpha(colors.secondary, 0.04),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },

  eventChip: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor:
      alpha(colors.primary, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  eventChipDay: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },

  eventChipMonth: {
    fontSize: 8.5,
    letterSpacing: 0.06,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  eventTextBlock: {
    flex: 1,
    marginRight: 4,
  },

  eventName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },

  eventDate: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '400',
    marginTop: 2,
  },
});
