// src/components/ui/Calendar.tsx
// Full calendar component with month/week/day views, event rendering,
// and navigation. Events are passed in — state lives in a Zustand slice.

import * as React from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay,
  addMonths, subMonths, addWeeks, subWeeks, addDays, subDays,
  startOfDay, getHours, getMinutes, parseISO,
} from 'date-fns'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string
  title: string
  start: string        // ISO 8601
  end: string          // ISO 8601
  color?: string       // Tailwind bg class, e.g. 'bg-brand-500'
  allDay?: boolean
}

export type CalendarView = 'month' | 'week' | 'day'

interface CalendarProps {
  events?: CalendarEvent[]
  initialDate?: Date
  initialView?: CalendarView
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  onRangeChange?: (start: Date, end: Date) => void
  className?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const VIEW_LABELS: Record<CalendarView, string> = { month: 'Month', week: 'Week', day: 'Day' }
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getEventsForDay(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter(e => isSameDay(parseISO(e.start), date))
}

function eventColor(event: CalendarEvent): string {
  return event.color ?? 'bg-brand-500'
}

// ── Event pill ────────────────────────────────────────────────────────────────

function EventPill({ event, onClick, compact = false }: { event: CalendarEvent; onClick?: () => void; compact?: boolean }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
      className={cn(
        'w-full text-left rounded px-1.5 truncate text-white text-xs font-medium',
        compact ? 'py-0.5' : 'py-1',
        eventColor(event),
        'hover:opacity-90 transition-opacity'
      )}
      title={event.title}
    >
      {!compact && !event.allDay && (
        <span className="opacity-75 mr-1">{format(parseISO(event.start), 'h:mm')}</span>
      )}
      {event.title}
    </button>
  )
}

// ── Month view ────────────────────────────────────────────────────────────────

function MonthView({ date, events, onEventClick, onDateClick }: {
  date: Date
  events: CalendarEvent[]
  onEventClick?: (e: CalendarEvent) => void
  onDateClick?: (d: Date) => void
}) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  return (
    <div className="flex-1 overflow-hidden">
      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAY_LABELS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: `repeat(${days.length / 7}, minmax(100px, 1fr))` }}>
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day)
          const isCurrentMonth = isSameMonth(day, date)
          const isCurrentDay = isToday(day)

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick?.(day)}
              className={cn(
                'border-r border-b border-gray-100 p-1.5 min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors',
                !isCurrentMonth && 'bg-gray-50/50'
              )}
            >
              <span className={cn(
                'inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium mb-1',
                isCurrentDay ? 'bg-brand-500 text-white' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              )}>
                {format(day, 'd')}
              </span>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(event => (
                  <EventPill key={event.id} event={event} onClick={() => onEventClick?.(event)} compact />
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-xs text-gray-400 px-1">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Week view ─────────────────────────────────────────────────────────────────

function WeekView({ date, events, onEventClick, onDateClick }: {
  date: Date
  events: CalendarEvent[]
  onEventClick?: (e: CalendarEvent) => void
  onDateClick?: (d: Date) => void
}) {
  const weekStart = startOfWeek(date)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="flex-1 overflow-auto">
      {/* Day headers */}
      <div className="grid sticky top-0 bg-white z-10 border-b border-gray-200" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
        <div />
        {days.map(day => (
          <div key={day.toISOString()} className="py-2 text-center border-l border-gray-100">
            <p className="text-xs text-gray-400">{format(day, 'EEE')}</p>
            <button
              onClick={() => onDateClick?.(day)}
              className={cn(
                'mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                isToday(day) ? 'bg-brand-500 text-white' : 'text-gray-900 hover:bg-gray-100'
              )}
            >
              {format(day, 'd')}
            </button>
          </div>
        ))}
      </div>
      {/* Time grid */}
      <div className="grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
        {HOURS.map(hour => (
          <React.Fragment key={hour}>
            <div className="py-3 pr-2 text-right text-xs text-gray-400 border-r border-gray-100">
              {hour === 0 ? '' : format(new Date().setHours(hour, 0), 'h a')}
            </div>
            {days.map(day => {
              const hourEvents = getEventsForDay(events, day).filter(e => {
                const h = getHours(parseISO(e.start))
                return h === hour && !e.allDay
              })
              return (
                <div key={day.toISOString()} className="relative border-l border-b border-gray-100 min-h-[52px] p-0.5">
                  {hourEvents.map(event => (
                    <EventPill key={event.id} event={event} onClick={() => onEventClick?.(event)} />
                  ))}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ── Day view ──────────────────────────────────────────────────────────────────

function DayView({ date, events, onEventClick }: {
  date: Date
  events: CalendarEvent[]
  onEventClick?: (e: CalendarEvent) => void
}) {
  const dayEvents = getEventsForDay(events, date)

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid" style={{ gridTemplateColumns: '48px 1fr' }}>
        {HOURS.map(hour => {
          const hourEvents = dayEvents.filter(e => getHours(parseISO(e.start)) === hour && !e.allDay)
          return (
            <React.Fragment key={hour}>
              <div className="py-3 pr-2 text-right text-xs text-gray-400 border-r border-gray-100">
                {hour === 0 ? '' : format(new Date().setHours(hour, 0), 'h a')}
              </div>
              <div className="relative border-b border-gray-100 min-h-[52px] p-1 space-y-0.5">
                {hourEvents.map(event => (
                  <EventPill key={event.id} event={event} onClick={() => onEventClick?.(event)} />
                ))}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ── Calendar ──────────────────────────────────────────────────────────────────

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({
    events = [],
    initialDate,
    initialView = 'month',
    onEventClick,
    onDateClick,
    onRangeChange,
    className,
  }, ref) => {
    const [currentDate, setCurrentDate] = React.useState(initialDate ?? new Date())
    const [view, setView] = React.useState<CalendarView>(initialView)

    const navigate = (direction: 1 | -1) => {
      setCurrentDate(prev => {
        if (view === 'month') return direction === 1 ? addMonths(prev, 1) : subMonths(prev, 1)
        if (view === 'week')  return direction === 1 ? addWeeks(prev, 1)  : subWeeks(prev, 1)
        return direction === 1 ? addDays(prev, 1) : subDays(prev, 1)
      })
    }

    const title = view === 'month'
      ? format(currentDate, 'MMMM yyyy')
      : view === 'week'
        ? `${format(startOfWeek(currentDate), 'MMM d')} – ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
        : format(currentDate, 'EEEE, MMMM d, yyyy')

    return (
      <div ref={ref} className={cn('flex flex-col bg-white rounded-[var(--radius-lg)] border border-gray-200 overflow-hidden', className)}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)} aria-label="Previous">
              <CaretLeft size={14} />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => navigate(1)} aria-label="Next">
              <CaretRight size={14} />
            </Button>
          </div>

          <h2 className="text-sm font-medium text-gray-900 min-w-[180px]">{title}</h2>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="text-gray-500"
          >
            Today
          </Button>

          <div className="ml-auto flex items-center rounded-[var(--radius-sm)] border border-gray-200 p-0.5 gap-0.5">
            {(['month', 'week', 'day'] as CalendarView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-medium transition-colors',
                  view === v ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                )}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
        </div>

        {/* View */}
        {view === 'month' && (
          <MonthView date={currentDate} events={events} onEventClick={onEventClick} onDateClick={onDateClick} />
        )}
        {view === 'week' && (
          <WeekView date={currentDate} events={events} onEventClick={onEventClick} onDateClick={onDateClick} />
        )}
        {view === 'day' && (
          <DayView date={currentDate} events={events} onEventClick={onEventClick} />
        )}
      </div>
    )
  }
)
Calendar.displayName = 'Calendar'

export { Calendar }
