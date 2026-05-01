import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, updateDoc, deleteDoc, doc, addDoc, Timestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Language } from '../types';
import { Users, CreditCard, ClipboardList, BarChart3, Plus, Search, X, ChevronLeft, Shield, AlertCircle, Eye, Trash2, Edit2, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface AdminDashboardProps {
  profile: UserProfile;
  onBack: () => void;
  language: Language;
}

export default function AdminDashboard({ profile, onBack, language }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'inscriptions' | 'stats'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState<UserProfile | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInscriptionModal, setShowInscriptionModal] = useState(false);

  // Form states
  const [newPayment, setNewPayment] = useState({
    userId: '',
    amount: 0,
    concept: 'Mensualidad',
    status: 'paid',
    notes: '',
    nextPaymentDate: formatTimestamp(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  });

  const [newInscription, setNewInscription] = useState({
    userId: '',
    sport: '',
    plan: 'mensual',
    price: 0,
    status: 'active',
    notes: '',
    endDate: formatTimestamp(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList = usersSnap.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
      setUsers(usersList);

      const paymentsSnap = await getDocs(query(collection(db, 'payments'), orderBy('date', 'desc')));
      setPayments(paymentsSnap.docs.map(d => ({ ...d.data(), id: d.id })));

      const inscriptionsSnap = await getDocs(collection(db, 'inscriptions'));
      setInscriptions(inscriptionsSnap.docs.map(d => ({ ...d.data(), id: d.id })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(date: Date) {
    return date.toISOString().split('T')[0];
  }

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole as any } : u));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.uid !== userId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPayment = async () => {
    const user = users.find(u => u.uid === newPayment.userId);
    if (!user) return;
    try {
      const paymentData = {
        ...newPayment,
        userName: user.username,
        date: Timestamp.now(),
        nextPaymentDate: Timestamp.fromDate(new Date(newPayment.nextPaymentDate)),
        currency: 'EUR'
      };
      const docRef = await addDoc(collection(db, 'payments'), paymentData);
      setPayments(prev => [{ ...paymentData, id: docRef.id }, ...prev]);
      setShowPaymentModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddInscription = async () => {
    const user = users.find(u => u.uid === newInscription.userId);
    if (!user) return;
    try {
      const inscriptionData = {
        ...newInscription,
        userName: user.username,
        startDate: Timestamp.now(),
        endDate: Timestamp.fromDate(new Date(newInscription.endDate))
      };
      const docRef = await addDoc(collection(db, 'inscriptions'), inscriptionData);
      setInscriptions(prev => [{ ...inscriptionData, id: docRef.id }, ...prev]);
      setShowInscriptionModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-white/5">
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h1 className="text-3xl font-headline font-black uppercase italic italic flex items-center gap-2">
              <Shield className="text-red-500" /> Admin Dashboard
            </h1>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mt-1">Gestión Central de la Academia</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
        {[
          { id: 'users', label: 'Usuarios', icon: Users },
          { id: 'payments', label: 'Pagos', icon: CreditCard },
          { id: 'inscriptions', label: 'Inscripciones', icon: ClipboardList },
          { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest h-12 px-6 min-w-fit ${activeTab === tab.id ? 'bg-primary text-black' : ''}`}
          >
            <tab.icon size={16} className="mr-2" /> {tab.label}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <Input 
                      placeholder="Buscar por nombre o email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/5 border-white/10 pl-12 h-12 rounded-xl"
                    />
                  </div>
                  <div className="px-6 py-3 bg-primary/10 border border-primary/20 rounded-xl text-primary font-black uppercase text-xs">
                    {filteredUsers.length} Usuarios Registrados
                  </div>
                </div>

                <div className="bg-[#111318] rounded-[2rem] border border-white/5 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                        <th className="p-6">Nombre</th>
                        <th className="p-6">Email</th>
                        <th className="p-6">Deportes</th>
                        <th className="p-6">Rol</th>
                        <th className="p-6">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map(user => (
                        <tr key={user.uid} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary">
                                {user.username?.[0]?.toUpperCase()}
                              </div>
                              <span className="font-bold">{user.username}</span>
                            </div>
                          </td>
                          <td className="p-6 text-white/60 text-sm">{user.email}</td>
                          <td className="p-6">
                            <div className="flex flex-wrap gap-1">
                              {user.sports?.map(s => (
                                <span key={s.sport} className="px-2 py-0.5 bg-white/5 rounded-md text-[9px] font-bold uppercase">{s.sport}</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-6">
                            <select 
                              value={user.role} 
                              onChange={(e) => handleUpdateRole(user.uid, e.target.value)}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs uppercase font-black"
                            >
                              <option value="user">User</option>
                              <option value="trainer">Trainer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => setShowUserModal(user)} className="h-8 w-8 text-primary/60 hover:text-primary">
                                <Eye size={16} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.uid)} className="h-8 w-8 text-red-500/60 hover:text-red-500">
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-green-500/10 border-green-500/20 rounded-3xl">
                    <h3 className="text-xs font-black uppercase text-green-400 opacity-60 mb-2">Total Cobrado (Mes)</h3>
                    <div className="text-2xl font-black text-green-400">
                      {payments
                        .filter(p => p.status === 'paid' && p.date?.toDate().getMonth() === new Date().getMonth())
                        .reduce((acc, p) => acc + (p.amount || 0), 0)
                        .toLocaleString()} €
                    </div>
                  </Card>
                  <Card className="p-6 bg-red-500/10 border-red-500/20 rounded-3xl">
                    <h3 className="text-xs font-black uppercase text-red-400 opacity-60 mb-2">Pagos Pendientes</h3>
                    <div className="text-2xl font-black text-red-400">
                      {payments.filter(p => p.status === 'pending').length} Facturas
                    </div>
                  </Card>
                  <Button 
                    onClick={() => setShowPaymentModal(true)}
                    className="h-full bg-primary text-black font-black uppercase tracking-widest rounded-3xl"
                  >
                    <Plus size={24} className="mr-2" /> Registrar Pago
                  </Button>
                </div>

                <div className="bg-[#111318] rounded-[2rem] border border-white/5 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                        <th className="p-6">Usuario</th>
                        <th className="p-6">Fecha</th>
                        <th className="p-6">Importe</th>
                        <th className="p-6">Concepto</th>
                        <th className="p-6">Estado</th>
                        <th className="p-6">Próximo Pago</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-6 font-bold">{payment.userName}</td>
                          <td className="p-6 text-sm text-white/60">
                            {payment.date?.toDate().toLocaleDateString()}
                          </td>
                          <td className="p-6 font-black text-primary">{payment.amount} €</td>
                          <td className="p-6 text-sm">{payment.concept}</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              payment.status === 'paid' ? 'bg-green-500/20 text-green-400' : 
                              payment.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {payment.status === 'paid' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : 'Atrasado'}
                            </span>
                          </td>
                          <td className="p-6 text-sm text-white/40">
                            {payment.nextPaymentDate?.toDate().toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'inscriptions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-headline font-bold uppercase italic">Inscripciones Activas</h3>
                  <Button onClick={() => setShowInscriptionModal(true)} className="bg-primary text-black font-black uppercase tracking-widest rounded-xl">
                    <Plus size={18} className="mr-2" /> Nueva Inscripción
                  </Button>
                </div>

                <div className="bg-[#111318] rounded-[2rem] border border-white/5 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                        <th className="p-6">Usuario</th>
                        <th className="p-6">Deporte</th>
                        <th className="p-6">Plan</th>
                        <th className="p-6">Vencimiento</th>
                        <th className="p-6">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {inscriptions.map(insc => {
                        const daysLeft = insc.endDate ? Math.ceil((insc.endDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                        const isExpiring = daysLeft > 0 && daysLeft <= 7;
                        
                        return (
                          <tr key={insc.id} className={`hover:bg-white/[0.02] transition-colors ${daysLeft <= 0 ? 'opacity-50' : ''}`}>
                            <td className="p-6 font-bold">{insc.userName}</td>
                            <td className="p-6 font-bold text-primary uppercase text-xs">{insc.sport}</td>
                            <td className="p-6 uppercase text-xs font-black">{insc.plan}</td>
                            <td className="p-6">
                              <div className="flex flex-col">
                                <span className="text-sm">{insc.endDate?.toDate().toLocaleDateString()}</span>
                                {isExpiring && <span className="text-[10px] font-black text-amber-500 uppercase">Vence en {daysLeft} días</span>}
                              </div>
                            </td>
                            <td className="p-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                insc.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'
                              }`}>
                                {insc.status === 'active' ? 'Activa' : 'Expirada'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Stats */}
                <Card className="p-8 bg-white/5 border-white/10 rounded-[2.5rem] flex flex-col justify-between">
                  <div>
                    <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-4">Usuarios Activos</h4>
                    <div className="text-5xl font-black italic uppercase tracking-tighter">
                      {users.length}
                    </div>
                  </div>
                  <div className="mt-8 flex gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-full h-12 relative overflow-hidden">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${20 + Math.random() * 80}%` }}
                          className="absolute bottom-0 w-full bg-primary"
                        />
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Sport Popularity */}
                <Card className="p-8 bg-white/5 border-white/10 rounded-[2.5rem] md:col-span-2">
                  <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-6">Popularidad por Deporte</h4>
                  <div className="space-y-4">
                    {Array.from(new Set(users.flatMap(u => u.sports?.map(s => s.sport) || [])))
                      .map(sportName => {
                        const count = users.filter(u => u.sports?.some(s => s.sport === sportName)).length;
                        const percentage = (count / users.length) * 100;
                        return (
                          <div key={sportName} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase italic italic">
                              <span>{sportName}</span>
                              <span className="text-primary">{count} alumnos</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className="h-full bg-primary"
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </Card>

                {/* Role Distribution */}
                <Card className="p-8 bg-white/5 border-white/10 rounded-[2.5rem]">
                   <h4 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-6">Roles</h4>
                   <div className="space-y-6">
                      {['user', 'trainer', 'admin'].map(role => {
                         const count = users.filter(u => u.role === role).length;
                         return (
                            <div key={role} className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${role === 'admin' ? 'bg-red-500' : role === 'trainer' ? 'bg-primary' : 'bg-white/20'}`} />
                                  <span className="text-xs font-black uppercase opacity-60 tracking-widest">{role}</span>
                               </div>
                               <span className="font-black italic uppercase italic">{count}</span>
                            </div>
                         )
                      })}
                   </div>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#111318] border border-white/10 w-full max-w-2xl rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-black text-3xl font-black">
                      {showUserModal.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-headline font-black uppercase italic italic">{showUserModal.username}</h2>
                      <p className="text-white/40 text-sm font-bold">{showUserModal.email}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">{showUserModal.role}</span>
                        {showUserModal.gender && <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest">{showUserModal.gender}</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowUserModal(null)} className="rounded-full bg-white/5">
                    <X size={20} />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase text-white/40 block mb-1">Edad</span>
                    <span className="font-bold">{showUserModal.age} años</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase text-white/40 block mb-1">Peso</span>
                    <span className="font-bold">{showUserModal.weight} kg</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase text-white/40 block mb-1">Altura</span>
                    <span className="font-bold">{showUserModal.height} cm</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase text-white/40 block mb-1">Nivel</span>
                    <span className="font-bold uppercase text-[10px]">{showUserModal.experienceLevel}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-primary tracking-widest">Deportes Activos</h4>
                  <div className="grid gap-3">
                    {showUserModal.sports?.map(sport => (
                      <div key={sport.sport} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"><Dumbbell size={16} /></div>
                           <span className="font-bold uppercase text-sm italic">{sport.sport}</span>
                        </div>
                        <div className="text-[10px] font-black uppercase opacity-60">
                           {sport.daysPerWeek} días/semana • {sport.durationPerSession} min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {showUserModal.injuries && (
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black uppercase text-red-400 flex items-center gap-2">
                      <AlertCircle size={14} /> Lesiones / Limitaciones
                    </h4>
                    <p className="text-sm text-red-200/60 font-medium italic">"{showUserModal.injuries}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#111318] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-headline font-black uppercase italic italic">Registrar Pago</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowPaymentModal(false)} className="rounded-full bg-white/5"><X size={20} /></Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Alumno</label>
                  <select 
                    value={newPayment.userId}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold"
                  >
                    <option value="">Seleccionar alumno...</option>
                    {users.map(u => <option key={u.uid} value={u.uid}>{u.username}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Importe (€)</label>
                    <Input 
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="bg-white/5 border-white/10 h-12 rounded-xl text-primary font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Estado</label>
                    <select 
                      value={newPayment.status}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold"
                    >
                      <option value="paid">Pagado</option>
                      <option value="pending">Pendiente</option>
                      <option value="overdue">Atrasado</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Concepto</label>
                  <select 
                    value={newPayment.concept}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, concept: e.target.value }))}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold"
                  >
                    <option value="Mensualidad">Mensualidad</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                    <option value="Sesión Suelta">Sesión Suelta</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Próximo Pago</label>
                  <Input 
                    type="date"
                    value={newPayment.nextPaymentDate}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, nextPaymentDate: e.target.value }))}
                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                  />
                </div>
              </div>

              <Button onClick={handleAddPayment} className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-2xl">
                Confirmar Pago
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inscription Modal placeholder - same structure as Payment Modal but for inscriptions collection */}
      <AnimatePresence>
        {showInscriptionModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInscriptionModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#111318] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-headline font-black uppercase italic italic">Nueva Inscripción</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowInscriptionModal(false)} className="rounded-full bg-white/5"><X size={20} /></Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Alumno</label>
                  <select 
                    value={newInscription.userId}
                    onChange={(e) => setNewInscription(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold"
                  >
                    <option value="">Seleccionar alumno...</option>
                    {users.map(u => <option key={u.uid} value={u.uid}>{u.username}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Deporte</label>
                  <select 
                    value={newInscription.sport}
                    onChange={(e) => setNewInscription(prev => ({ ...prev, sport: e.target.value }))}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold"
                  >
                    <option value="">Seleccionar deporte...</option>
                    {users.find(u => u.uid === newInscription.userId)?.sports?.map(s => <option key={s.sport} value={s.sport}>{s.sport}</option>)}
                    {!newInscription.userId && <option disabled>Primero selecciona un alumno</option>}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Plan</label>
                     <select 
                        value={newInscription.plan}
                        onChange={(e) => setNewInscription(prev => ({ ...prev, plan: e.target.value as any }))}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold"
                     >
                        <option value="mensual">Mensual</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="anual">Anual</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Precio (€)</label>
                     <Input 
                        type="number"
                        value={newInscription.price}
                        onChange={(e) => setNewInscription(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="bg-white/5 border-white/10 h-12 rounded-xl text-primary font-black"
                     />
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Fecha de Fin</label>
                  <Input 
                    type="date"
                    value={newInscription.endDate}
                    onChange={(e) => setNewInscription(prev => ({ ...prev, endDate: e.target.value }))}
                    className="bg-white/5 border-white/10 h-12 rounded-xl"
                  />
                </div>
              </div>

              <Button onClick={handleAddInscription} className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-2xl">
                Activar Inscripción
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
