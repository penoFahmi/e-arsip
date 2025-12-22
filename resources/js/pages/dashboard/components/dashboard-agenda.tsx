import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
    agendas: any[];
}

export default function DashboardAgenda({ agendas }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const normalizeDate = (dateString: string) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const hasAgenda = (day: number) => {
        const checkDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return agendas.some(a => normalizeDate(a.tgl_mulai) === checkDate);
    };

    const displayAgendas = selectedDate
        ? agendas.filter(a => normalizeDate(a.tgl_mulai) === selectedDate)
        : agendas;

    const formatDateIndo = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <Card className="xl:col-span-2 shadow-sm border-l-4 border-l-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                    Agenda & Kalender Kegiatan
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row h-full">

                    <div className="p-4 md:w-[320px] shrink-0 border-b md:border-b-0 md:border-r bg-slate-50/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700 capitalize">
                                {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                            </h3>
                            <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 text-center text-xs mb-2 text-gray-400 font-medium">
                            <div>M</div><div>S</div><div>S</div><div>R</div><div>K</div><div>J</div><div>S</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-sm">
                            {blanks.map((_, i) => <div key={`blank-${i}`} className="h-8"></div>)}

                            {days.map(day => {
                                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const agendaExists = hasAgenda(day);
                                const isSelected = selectedDate === dateStr;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                                        className={`
                                            h-9 w-9 rounded-full flex items-center justify-center relative transition-all text-xs font-medium
                                            ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-100 text-gray-700'}
                                            ${isToday && !isSelected ? 'border border-blue-600 font-bold text-blue-700' : ''}
                                        `}
                                    >
                                        {day}
                                        {agendaExists && (
                                            <span className={`absolute bottom-1.5 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`}></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t text-[10px] text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            <span>Menandakan ada kegiatan</span>
                        </div>
                    </div>

                    <div className="flex-1 p-4 md:p-6 bg-white min-h-[300px]">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-between pb-2 border-b border-dashed">
                            <span className="flex items-center gap-2">
                                {selectedDate ? `Jadwal: ${formatDateIndo(selectedDate)}` : "Agenda Terdekat"}
                            </span>
                            {selectedDate && (
                                <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setSelectedDate(null)}>
                                    Reset Filter
                                </Button>
                            )}
                        </h4>

                        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                            {displayAgendas.length > 0 ? (
                                displayAgendas.map((agenda: any) => (
                                    <div key={agenda.id} className="flex gap-4 p-3 rounded-lg border border-gray-100 bg-white hover:border-blue-300 hover:bg-blue-50/30 transition-all group shadow-sm">
                                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-md bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                                            <span className="text-[10px] font-bold uppercase">
                                                {new Date(agenda.tgl_mulai).toLocaleString('id-ID', { month: 'short' })}
                                            </span>
                                            <span className="text-xl font-bold leading-none">
                                                {new Date(agenda.tgl_mulai).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="font-semibold text-gray-900 truncate text-sm" title={agenda.judul_agenda}>
                                                {agenda.judul_agenda}
                                            </h5>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    <Clock className="h-3 w-3" />
                                                    {agenda.jam_mulai?.substring(0, 5)} WIB
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {agenda.lokasi || 'Kantor'}
                                                </div>
                                            </div>
                                            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-400">
                                                <Users className="h-3 w-3" />
                                                PJ: {agenda.penanggung_jawab?.name || '-'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-gray-50/50 rounded-lg border-2 border-dashed">
                                    <CalendarIcon className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-sm font-medium">Tidak ada agenda.</p>
                                    {selectedDate && <p className="text-xs">Coba pilih tanggal lain.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
