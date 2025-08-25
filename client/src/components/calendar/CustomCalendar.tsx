import { useState } from 'react';
import Calendar from 'react-calendar';
import { Clock, MapPin, Users } from 'lucide-react';
import './Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  time: string;
  type: 'meeting' | 'interview' | 'evaluation' | 'event' | 'birthday';
  location?: string;
  attendees?: number;
  description?: string;
}

interface CustomCalendarProps {
  events?: CalendarEvent[];
  onDateChange?: (date: Date) => void;
  selectedDate?: Date;
}

export default function CustomCalendar({ events = [], onDateChange, selectedDate }: CustomCalendarProps) {
  const [value, setValue] = useState<Value>(selectedDate || new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const handleDateChange = (newValue: Value) => {
    setValue(newValue);
    if (newValue instanceof Date && onDateChange) {
      onDateChange(newValue);
    }
  };

  // Função para verificar se uma data tem eventos
  const hasEvents = (date: Date) => {
    return events.some(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // Função para obter eventos de uma data específica
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // Função para adicionar classes customizadas aos tiles
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const eventsCount = getEventsForDate(date).length;
      if (eventsCount > 0) {
        return 'has-events';
      }
    }
    return null;
  };

  // Função para adicionar conteúdo customizado aos tiles
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(date);
      if (dayEvents.length > 0) {
        return (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div 
              className={`w-1.5 h-1.5 rounded-full ${
                dayEvents.length === 1 ? 'bg-blue-500' : 
                dayEvents.length === 2 ? 'bg-orange-500' : 
                'bg-red-500'
              }`}
              title={`${dayEvents.length} evento(s)`}
            />
          </div>
        );
      }
    }
    return null;
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-600';
      case 'interview': return 'bg-green-100 text-green-600';
      case 'evaluation': return 'bg-purple-100 text-purple-600';
      case 'event': return 'bg-orange-100 text-orange-600';
      case 'birthday': return 'bg-pink-100 text-pink-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return <Users className="w-3 h-3" />;
      case 'interview': return <Users className="w-3 h-3" />;
      case 'evaluation': return <Clock className="w-3 h-3" />;
      case 'event': return <Clock className="w-3 h-3" />;
      case 'birthday': return <span className="text-xs">🎂</span>;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const selectedDateEvents = value instanceof Date ? getEventsForDate(value) : [];

  return (
    <div className="space-y-4">
      {/* Calendário */}
      <div className="calendar-with-events">
        <Calendar
          onChange={handleDateChange}
          value={value}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate || new Date())}
          tileClassName={tileClassName}
          tileContent={tileContent}
          locale="pt-BR"
          showNeighboringMonth={false}
          formatDay={(locale, date) => date.getDate().toString()}
        />
      </div>

      {/* Lista de eventos do dia selecionado */}
      {selectedDateEvents.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Eventos - {value instanceof Date ? value.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : ''}
          </h4>
          <div className="space-y-2">
            {selectedDateEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className={`p-1 rounded-full ${getEventTypeColor(event.type)}`}>
                  {getEventTypeIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 text-sm">{event.title}</h5>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span>{event.time}</span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      </>
                    )}
                    {event.attendees && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{event.attendees} pessoas</span>
                        </div>
                      </>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem quando não há eventos */}
      {selectedDateEvents.length === 0 && value instanceof Date && (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-2">📅</div>
          <p className="text-sm text-gray-500">
            Nenhum evento agendado para {value.toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
}
