import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react';
import { useEmployeeStore } from './employeeStore';

interface AttendanceProps {
    employeeId: string;
}

export default function EmployeeAttendance({ employeeId }: AttendanceProps) {
    const {
        absences, createAbsence, fetchAbsences, deleteAbsence,
        absenceReasons, fetchAbsenceReasons,
        selectedEmployee, fetchEmployee
    } = useEmployeeStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal Form State
    const [isFullDay, setIsFullDay] = useState(false);
    const [hours, setHours] = useState(0);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedReasonId, setSelectedReasonId] = useState('');
    const [note, setNote] = useState('');

    // Auto-calculate hours when times change
    useEffect(() => {
        if (startTime && endTime && !isFullDay) {
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);

            const start = new Date(0, 0, 0, startH, startM);
            const end = new Date(0, 0, 0, endH, endM);

            let diffMs = end.getTime() - start.getTime();
            if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

            const diffHours = diffMs / (1000 * 60 * 60);
            setHours(Math.round(diffHours * 100) / 100);
        }
    }, [startTime, endTime, isFullDay]);

    // Ensure employee data is loaded (for contracts) - existing useEffect
    useEffect(() => {
        if (employeeId) {
            fetchAbsences(employeeId);
            fetchAbsenceReasons();
            if (!selectedEmployee || selectedEmployee.id !== employeeId) {
                fetchEmployee(employeeId);
            }
        }
    }, [employeeId, fetchAbsences, fetchAbsenceReasons, fetchEmployee]); // Removed selectedEmployee from deps to avoid loop if object ref changes, but logic handles it

    // Determine Work Schedule
    const workSchedule = useMemo(() => {
        if (!selectedEmployee?.contracts) return 'FIVE_DAYS';
        const activeContract = selectedEmployee.contracts.find((c: any) => c.status === 'RUNNING');
        return activeContract?.workSchedule || 'FIVE_DAYS';
    }, [selectedEmployee]);

    const isSixDays = workSchedule === 'SIX_DAYS';

    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    useEffect(() => {
        // Clear selection if mode turned off
        if (!isSelectionMode) setSelectedDates([]);
    }, [isSelectionMode]);

    const handleDateClick = (date: Date) => {
        const day = date.getDay();
        const isWeekend = isSixDays ? (day === 5) : (day === 5 || day === 6);

        if (isWeekend) {
            return;
        }

        if (isSelectionMode) {
            setSelectedDates(prev => {
                const exists = prev.find(d => d.getTime() === date.getTime());
                if (exists) {
                    return prev.filter(d => d.getTime() !== date.getTime());
                } else {
                    return [...prev, date];
                }
            });
        } else {
            setSelectedDate(date);
            setIsModalOpen(true);
            setIsFullDay(false);
            setHours(0);
            setStartTime('');
            setEndTime('');
            setSelectedReasonId('');
            setNote('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const datesToProcess = selectedDates.length > 0 ? selectedDates : (selectedDate ? [selectedDate] : []);
        if (datesToProcess.length === 0) return;

        for (const date of datesToProcess) {
            await createAbsence({
                employeeId,
                date: date.toISOString(),
                isFullDay,
                hours: isFullDay ? null : Number(hours),
                startTime: isFullDay ? null : startTime,
                endTime: isFullDay ? null : endTime,
                reasonId: selectedReasonId,
                reason: note
            });
        }

        setIsFullDay(false);
        setHours(0);
        setStartTime('');
        setEndTime('');
        setSelectedReasonId('');
        setNote('');
        setIsModalOpen(false);
        setSelectedDates([]);
        fetchAbsences(employeeId);
    };

    const getAbsencesForDate = (date: Date) => {
        return absences.filter((a: any) => {
            const d = new Date(a.date);
            return d.getDate() === date.getDate() &&
                d.getMonth() === date.getMonth() &&
                d.getFullYear() === date.getFullYear();
        });
    };
    // ...
    const getDayStyle = (date: Date) => {
        const day = date.getDay();
        // 5 = Friday, 6 = Saturday
        const isWeekend = isSixDays ? (day === 5) : (day === 5 || day === 6);
        const dayAbsences = getAbsencesForDate(date);

        let bg = 'white';
        let cursor = 'pointer';
        let border = '1px solid #e2e8f0';
        let transform = 'none';
        let boxShadow = 'none';

        if (isWeekend) {
            bg = '#f1f5f9';
            cursor = 'not-allowed';
            border = '1px solid #cbd5e1';
        } else if (dayAbsences.length > 0) {
            // If any unauthorized, show light red background
            const hasUnauthorized = dayAbsences.some((a: any) => a.reasonRel?.isAuthorized === false || !a.reasonRel);
            bg = hasUnauthorized ? '#fee2e2' : '#dcfce7';
            border = hasUnauthorized ? '1px solid #ef4444' : '1px solid #166534';
        }

        return {
            minHeight: '100px',
            backgroundColor: bg,
            cursor,
            border,
            borderRadius: '8px',
            padding: '0.5rem',
            position: 'relative' as 'relative',
            transition: 'all 0.1s ease-in-out',
            display: 'flex',
            flexDirection: 'column' as 'column',
            justifyContent: 'space-between',
            transform,
            boxShadow
        };
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Helper to render absence list in modal
    const renderAbsenceList = () => {
        if (!selectedDate) return null;
        const dayAbsences = getAbsencesForDate(selectedDate);

        if (dayAbsences.length === 0) return <p style={{ color: '#6b7280', fontSize: '0.875rem', fontStyle: 'italic' }}>Aucune absence pour ce jour.</p>;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {dayAbsences.map((abs: any) => (
                    <div key={abs.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1e293b' }}>
                                {abs.reasonRel?.name || 'Absence'}
                                <span style={{
                                    fontSize: '0.75rem', marginLeft: '0.5rem',
                                    color: abs.reasonRel?.isAuthorized ? '#15803d' : '#b91c1c',
                                    backgroundColor: abs.reasonRel?.isAuthorized ? '#dcfce7' : '#fee2e2',
                                    padding: '2px 6px', borderRadius: '4px'
                                }}>
                                    {abs.reasonRel?.isAuthorized ? 'Autorisé' : 'Non autorisé'}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {abs.isFullDay ? 'Journée entière' : `${abs.hours} heures`}
                                {abs.reason && ` • ${abs.reason}`}
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm('Supprimer cette absence ?')) {
                                    await deleteAbsence(abs.id, employeeId);
                                }
                            }}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            title="Supprimer"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    const monthlyTotals = useMemo(() => {
        const currentMonthAbsences = absences.filter((a: any) => {
            const d = new Date(a.date);
            return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
        });

        let authorized = 0;
        let unauthorized = 0;

        currentMonthAbsences.forEach((a: any) => {
            const h = a.isFullDay ? 8 : (a.hours || 0);
            if (a.reasonRel?.isAuthorized) {
                authorized += h;
            } else {
                unauthorized += h;
            }
        });

        // Calculate potential hours
        let potentialHours = 0;
        const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const day = date.getDay();
            const isWeekend = isSixDays ? (day === 5) : (day === 5 || day === 6);
            if (!isWeekend) {
                potentialHours += 8;
            }
        }

        const workedHours = Math.max(0, potentialHours - (authorized + unauthorized));

        return { authorized, unauthorized, potentialHours, workedHours };
    }, [absences, currentDate, isSixDays]);

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'capitalize', margin: 0 }}>{monthName} Planning</h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                        <div style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                            Autorisé : {monthlyTotals.authorized}h
                        </div>
                        <div style={{ color: '#b91c1c', backgroundColor: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                            Non autorisé : {monthlyTotals.unauthorized}h
                        </div>
                        <div style={{ color: '#1e40af', backgroundColor: '#dbeafe', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                            Travaillé : {monthlyTotals.workedHours}h / {monthlyTotals.potentialHours}h
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => setIsSelectionMode(!isSelectionMode)}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500,
                            backgroundColor: isSelectionMode ? '#bfdbfe' : 'white',
                            color: isSelectionMode ? '#1e40af' : '#64748b',
                            border: isSelectionMode ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        {isSelectionMode ? 'Mode Sélection Activé' : 'Activer Sélection Multiple'}
                    </button>

                    {isSelectionMode && selectedDates.length > 0 && (
                        <button
                            onClick={() => {
                                // Prepare for bulk add
                                setSelectedDate(selectedDates[0]); // Just for context if needed, though handleSubmit uses selectedDates
                                setIsModalOpen(true);
                            }}
                            style={{ ...primaryBtnStyle, backgroundColor: '#ea580c' }}
                        >
                            Ajouter absence ({selectedDates.length})
                        </button>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handlePrevMonth} style={navBtnStyle}><ChevronLeft size={20} /></button>
                        <button onClick={handleNextMonth} style={navBtnStyle}><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                {['Dim', 'Lun', 'Mar', 'Mer', ' Jeu', 'Ven', 'Sam'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontWeight: 'bold', color: '#64748b', paddingBottom: '0.5rem' }}>{d}</div>
                ))}

                {/* Empty cells for start of month */}
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {daysInMonth.map(date => {
                    const dayAbsences = getAbsencesForDate(date);
                    return (
                        <div key={date.toISOString()} style={getDayStyle(date)} onClick={() => handleDateClick(date)}>
                            <div style={{ fontWeight: 'bold', color: '#334155', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {date.getDate()}
                                {selectedDates.some(d => d.getTime() === date.getTime()) && (
                                    <div style={{ width: '10px', height: '10px', backgroundColor: '#2563eb', borderRadius: '50%' }} />
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', maxHeight: '60px' }}>
                                {dayAbsences.map((abs: any, idx: number) => (
                                    <div key={idx} style={{
                                        fontSize: '0.7rem', fontWeight: 600,
                                        color: abs.reasonRel?.isAuthorized ? '#15803d' : '#b91c1c',
                                        backgroundColor: 'rgba(255,255,255,0.6)',
                                        padding: '2px 4px', borderRadius: '4px',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {abs.isFullDay ? '(J)' : (abs.startTime && abs.endTime ? `${abs.startTime}-${abs.endTime}` : `(${abs.hours}h)`)} {abs.reasonRel?.name || 'Absence'}
                                    </div>
                                ))}
                            </div>

                            {(date.getDay() === 5 || date.getDay() === 6) && (
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginTop: 'auto' }}>Off</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {isModalOpen && selectedDate && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                {selectedDates.length > 0 ? `Ajouter sur ${selectedDates.length} jours` : `Absences du ${selectedDate.toLocaleDateString()}`}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>×</button>
                        </div>

                        {/* Existing Absences List - Hide if bulk selection to keep it simple, or just show for the one selected context date */}
                        {selectedDates.length === 0 && (
                            <div style={{ marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Déjà enregistré :</h4>
                                {renderAbsenceList()}
                                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />
                            </div>
                        )}

                        {/* Add New Absence Form */}
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '1rem' }}>Ajouter une nouvelle absence :</h4>
                        <form onSubmit={handleSubmit}>
                            {/* Reason Dropdown */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Motif <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    value={selectedReasonId}
                                    onChange={e => setSelectedReasonId(e.target.value)}
                                    style={inputStyle}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    {absenceReasons.map((r: any) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} {r.isAuthorized ? '(Autorisé)' : '(Non autorisé)'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>
                                    <input type="checkbox" checked={isFullDay} onChange={e => setIsFullDay(e.target.checked)} />
                                    Toute la journée
                                </label>
                            </div>

                            {!isFullDay && (
                                <>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={labelStyle}>Heure début</label>
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={e => setStartTime(e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={labelStyle}>Heure fin</label>
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={e => setEndTime(e.target.value)}
                                                style={inputStyle}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={labelStyle}>Heures calculées <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input
                                            type="number"
                                            value={hours}
                                            onChange={e => setHours(Number(e.target.value))}
                                            style={inputStyle}
                                            min="0"
                                            step="0.01"
                                        />
                                        {hours > 0 && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Soit {Math.floor(hours)}h {Math.round((hours % 1) * 60)}m</span>}
                                    </div>
                                </>
                            )}

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Note (Optionnel)</label>
                                <textarea
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    style={{ ...inputStyle, minHeight: '60px' }}
                                    placeholder="Détails supplémentaires..."
                                />
                            </div>

                            <button type="submit" style={{ ...primaryBtnStyle, width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                <Plus size={18} /> Ajouter cette absence
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Styles
const navBtnStyle = { padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalOverlayStyle: any = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalContentStyle: React.CSSProperties = { backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', width: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' };
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#475569' };
const inputStyle: any = { width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.925rem' };
const primaryBtnStyle: any = { padding: '0.625rem 1rem', borderRadius: '6px', backgroundColor: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 500, transition: 'background-color 0.2s' };
