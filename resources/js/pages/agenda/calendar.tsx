import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Calendar as BigCalendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/id';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users } from 'lucide-react';

moment.locale('id');
const localizer = momentLocalizer(moment);

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: {
        lokasi: string;
        bidang: string;
        warna: string;
    };
}

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [view, setView] = useState<View>(Views.MONTH);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('/api/agenda/events');
            // Konversi string date ke object Date JS
            const formattedEvents = response.data.map((ev: any) => ({
                ...ev,
                start: new Date(ev.start),
                end: new Date(ev.end),
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Gagal memuat jadwal:", error);
        }
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        return {
            style: {
                backgroundColor: event.resource.warna,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
                fontSize: '0.85em'
            }
        };
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Kalender Kegiatan', href: '/agenda/kalender' }]}>
            <Head title="Kalender Kegiatan" />

            <div className="flex h-full flex-col p-4 md:p-6 gap-6">
                <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">

                    {/* AREA KALENDER */}
                    <Card className="flex-1 shadow-md border-0 h-full">
                        <CardContent className="p-4 h-full">
                            <BigCalendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: '100%' }}
                                view={view}
                                onView={setView}
                                eventPropGetter={eventStyleGetter}
                                onSelectEvent={(event) => setSelectedEvent(event)}
                                messages={{
                                    next: "Maju",
                                    previous: "Mundur",
                                    today: "Hari Ini",
                                    month: "Bulan",
                                    week: "Minggu",
                                    day: "Hari",
                                    noEventsInRange: "Tidak ada jadwal di rentang ini."
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* SIDEBAR DETAIL EVENT */}
                    <div className="w-full md:w-80 shrink-0 space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-1">Keterangan Warna</h3>
                            <div className="text-xs space-y-1">
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Umum</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Penting</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Sosialisasi</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Rapat Internal</div>
                            </div>
                        </div>

                        {selectedEvent ? (
                            <Card className="border-l-4 animate-in slide-in-from-right" style={{ borderLeftColor: selectedEvent.resource.warna }}>
                                <CardContent className="p-4 space-y-3">
                                    <Badge variant="secondary">{selectedEvent.resource.bidang}</Badge>
                                    <h3 className="font-bold text-lg">{selectedEvent.title}</h3>

                                    <div className="text-sm space-y-2 text-gray-600">
                                        <div className="flex gap-2">
                                            <span className="font-semibold w-16">Mulai:</span>
                                            {moment(selectedEvent.start).format('DD MMM HH:mm')}
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold w-16">Selesai:</span>
                                            {moment(selectedEvent.end).format('DD MMM HH:mm')}
                                        </div>
                                        {selectedEvent.resource.lokasi && (
                                            <div className="flex items-center gap-2 text-orange-600">
                                                <MapPin className="h-4 w-4" />
                                                {selectedEvent.resource.lokasi}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="text-xs text-gray-400 hover:text-gray-600 underline mt-2"
                                    >
                                        Tutup Detail
                                    </button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="text-center text-gray-400 text-sm py-10 border-2 border-dashed rounded-xl">
                                Klik pada jadwal di kalender untuk melihat detail.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
