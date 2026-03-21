import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AppContext';
import { 
  MessageSquare, Send, Settings, AlertTriangle, CheckCircle, 
  XCircle, RefreshCw, Search, Phone, Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';

const AdminSMS = () => {
  const { api } = useAuth();
  
  const [settings, setSettings] = useState({
    enabled: false,
    usercode: '',
    password: '',
    msgheader: 'KKTCX'
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('KKTCX test mesajı');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, skipped: 0 });

  useEffect(() => {
    fetchSettings();
    fetchLogs();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      if (response.data?.netgsm) {
        setSettings(prev => ({ ...prev, ...response.data.netgsm }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/sms/logs?limit=100');
      setLogs(response.data.logs || []);
      
      // Calculate stats
      const logsData = response.data.logs || [];
      setStats({
        total: logsData.length,
        sent: logsData.filter(l => l.status === 'sent').length,
        failed: logsData.filter(l => l.status === 'failed').length,
        skipped: logsData.filter(l => l.status === 'skipped').length
      });
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings/netgsm', settings);
      toast.success('SMS ayarları kaydedildi');
    } catch (error) {
      toast.error('Kaydetme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const sendTestSMS = async () => {
    if (!testPhone) {
      toast.error('Telefon numarası giriniz');
      return;
    }
    
    setSending(true);
    try {
      const response = await api.post('/admin/sms/test', {
        phone: testPhone,
        message: testMessage
      });
      
      if (response.data.success) {
        toast.success('Test SMS\'i gönderildi');
        fetchLogs();
      } else {
        toast.error(response.data.error || 'SMS gönderilemedi');
      }
    } catch (error) {
      toast.error('SMS gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'skipped':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-white/40" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      sent: 'bg-emerald-500/20 text-emerald-400',
      failed: 'bg-red-500/20 text-red-400',
      skipped: 'bg-yellow-500/20 text-yellow-400'
    };
    return colors[status] || 'bg-white/10 text-white/60';
  };

  const filteredLogs = logs.filter(log => 
    log.phone?.includes(searchQuery) || 
    log.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div data-testid="admin-sms">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">SMS Yönetimi</h1>
        <p className="text-white/60 mt-1">Netgsm SMS entegrasyonu ve logları</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-white/50 text-xs">Toplam</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.sent}</p>
              <p className="text-white/50 text-xs">Gönderildi</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.failed}</p>
              <p className="text-white/50 text-xs">Başarısız</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.skipped}</p>
              <p className="text-white/50 text-xs">Atlandı</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Netgsm Settings */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#E91E63]" />
              Netgsm Ayarları
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-white/70">SMS Aktif</label>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 block">Kullanıcı Kodu</label>
                <Input
                  value={settings.usercode}
                  onChange={(e) => setSettings(prev => ({ ...prev, usercode: e.target.value }))}
                  className="input-glass"
                  placeholder="Netgsm kullanıcı kodu"
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 block">Şifre</label>
                <Input
                  type="password"
                  value={settings.password}
                  onChange={(e) => setSettings(prev => ({ ...prev, password: e.target.value }))}
                  className="input-glass"
                  placeholder="Netgsm şifresi"
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 block">Mesaj Başlığı</label>
                <Input
                  value={settings.msgheader}
                  onChange={(e) => setSettings(prev => ({ ...prev, msgheader: e.target.value }))}
                  className="input-glass"
                  placeholder="KKTCX"
                />
              </div>
              
              <Button onClick={saveSettings} className="btn-primary w-full" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>

          {/* Test SMS */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#E91E63]" />
              Test SMS Gönder
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Telefon Numarası</label>
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="input-glass"
                  placeholder="5XXXXXXXXX"
                />
              </div>
              
              <div>
                <label className="text-white/70 text-sm mb-2 block">Mesaj</label>
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="input-glass"
                />
              </div>
              
              <Button 
                onClick={sendTestSMS} 
                className="btn-outline w-full"
                disabled={sending || !settings.enabled}
              >
                {sending ? 'Gönderiliyor...' : 'Test Gönder'}
              </Button>
              
              {!settings.enabled && (
                <p className="text-yellow-400/70 text-xs text-center">
                  SMS göndermek için önce servisi aktif edin
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Logs Panel */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#E91E63]" />
                SMS Logları
              </h3>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-glass pl-10 w-48"
                    placeholder="Ara..."
                  />
                </div>
                <Button onClick={fetchLogs} variant="outline" size="sm" className="btn-outline">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-white/20 mb-4" />
                <p className="text-white/40">Henüz SMS logu bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredLogs.map((log, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Phone className="w-3 h-3 text-white/40" />
                            <span className="text-white font-medium">{log.phone}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(log.status)}`}>
                              {log.status === 'sent' ? 'Gönderildi' : 
                               log.status === 'failed' ? 'Başarısız' : 'Atlandı'}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm">{log.message}</p>
                          {log.error && (
                            <p className="text-red-400/70 text-xs mt-1">{log.error}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-white/40 text-xs whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSMS;
