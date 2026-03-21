import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  MapPin, Plus, Edit, Trash2, Search, Globe, Users,
  ChevronDown, Check, X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

const AdminCities = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [regionFilter, setRegionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name_tr: '', name_en: '', name_ru: '', name_de: '', name_el: '', slug: '', region: 'north'
  });

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  ];

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await api.get(`/cities?lang=${lang}`);
      setCities(response.data || []);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name_tr || !formData.name_en || !formData.slug) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      if (editingCity) {
        await api.put(`/admin/cities/${editingCity.id}`, formData);
        toast.success('Şehir güncellendi');
      } else {
        await api.post('/admin/cities', formData);
        toast.success('Şehir eklendi');
      }
      closeDialog();
      fetchCities();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const deleteCity = async (cityId) => {
    if (!confirm('Bu şehri silmek istediğinize emin misiniz?')) return;
    
    try {
      await api.delete(`/admin/cities/${cityId}`);
      toast.success('Şehir silindi');
      fetchCities();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const openEditDialog = (city) => {
    setEditingCity(city);
    setFormData({
      name_tr: city.name_tr || '',
      name_en: city.name_en || '',
      name_ru: city.name_ru || '',
      name_de: city.name_de || '',
      name_el: city.name_el || '',
      slug: city.slug || '',
      region: city.region || 'north'
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingCity(null);
    setFormData({
      name_tr: '', name_en: '', name_ru: '', name_de: '', name_el: '', slug: '', region: 'north'
    });
  };

  const filteredCities = cities.filter(city => {
    const matchesRegion = !regionFilter || city.region === regionFilter;
    const matchesSearch = !searchQuery || 
      city.name_tr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.name_en?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const northCities = filteredCities.filter(c => c.region === 'north');
  const southCities = filteredCities.filter(c => c.region === 'south');

  return (
    <div data-testid="admin-cities">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Şehirler</h1>
          <p className="text-white/60 mt-1">{cities.length} şehir • 5 dil desteği</p>
        </div>
        <Button className="btn-primary" onClick={() => setShowDialog(true)} data-testid="add-city">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Şehir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{cities.length}</p>
              <p className="text-white/50 text-xs">Toplam Şehir</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <span className="text-lg">🇹🇷</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{northCities.length}</p>
              <p className="text-white/50 text-xs">Kuzey Kıbrıs</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <span className="text-lg">🇨🇾</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{southCities.length}</p>
              <p className="text-white/50 text-xs">Güney Kıbrıs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Şehir ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass pl-10"
            />
          </div>
          <Select value={regionFilter || "all"} onValueChange={(v) => setRegionFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="input-glass w-[180px]">
              <Globe className="w-4 h-4 mr-2 text-white/40" />
              <SelectValue placeholder="Tüm Bölgeler" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151F] border-white/10">
              <SelectItem value="all">Tüm Bölgeler</SelectItem>
              <SelectItem value="north">Kuzey Kıbrıs</SelectItem>
              <SelectItem value="south">Güney Kıbrıs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cities Grid */}
      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* North Cyprus */}
          {(!regionFilter || regionFilter === 'north') && northCities.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-lg">🇹🇷</span>
                Kuzey Kıbrıs ({northCities.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {northCities.map((city) => (
                  <CityCard 
                    key={city.id} 
                    city={city} 
                    languages={languages}
                    onEdit={() => openEditDialog(city)}
                    onDelete={() => deleteCity(city.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* South Cyprus */}
          {(!regionFilter || regionFilter === 'south') && southCities.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-lg">🇨🇾</span>
                Güney Kıbrıs ({southCities.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {southCities.map((city) => (
                  <CityCard 
                    key={city.id} 
                    city={city} 
                    languages={languages}
                    onEdit={() => openEditDialog(city)}
                    onDelete={() => deleteCity(city.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="bg-[#15151F] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCity ? 'Şehri Düzenle' : 'Yeni Şehir Ekle'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Region */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Bölge *</label>
              <Select 
                value={formData.region} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, region: v }))}
              >
                <SelectTrigger className="input-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-white/10">
                  <SelectItem value="north">🇹🇷 Kuzey Kıbrıs</SelectItem>
                  <SelectItem value="south">🇨🇾 Güney Kıbrıs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Slug */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">URL Slug *</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                className="input-glass"
                placeholder="girne"
              />
            </div>

            {/* Language Names */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#E91E63]" />
                Şehir İsimleri
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {languages.map((language) => (
                  <div key={language.code}>
                    <label className="text-white/60 text-xs mb-1 flex items-center gap-1">
                      <span>{language.flag}</span> {language.name}
                      {(language.code === 'tr' || language.code === 'en') && <span className="text-red-400">*</span>}
                    </label>
                    <Input
                      value={formData[`name_${language.code}`] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [`name_${language.code}`]: e.target.value }))}
                      className="input-glass text-sm"
                      placeholder={language.code === 'tr' ? 'Girne' : language.code === 'en' ? 'Kyrenia' : ''}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={closeDialog} className="text-white/60">
                İptal
              </Button>
              <Button className="btn-primary" onClick={handleSubmit}>
                {editingCity ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// City Card Component
const CityCard = ({ city, languages, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="glass rounded-xl p-5 hover:border-[#E91E63]/30 transition-all" data-testid={`city-${city.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E91E63]/20 to-purple-500/20 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#E91E63]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{city.name_tr}</h3>
            <p className="text-white/40 text-sm">/{city.slug}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit} className="text-white/60 hover:text-white p-2">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-400 hover:text-red-300 p-2">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Language badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        {languages.map((lang) => {
          const hasTranslation = city[`name_${lang.code}`];
          return (
            <span 
              key={lang.code}
              className={`text-xs px-2 py-1 rounded-full ${
                hasTranslation 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}
              title={hasTranslation ? city[`name_${lang.code}`] : 'Çeviri yok'}
            >
              {lang.flag} {hasTranslation ? <Check className="w-3 h-3 inline" /> : <X className="w-3 h-3 inline" />}
            </span>
          );
        })}
      </div>

      {/* Expand for translations */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-white/40 text-xs mt-3 flex items-center gap-1 hover:text-white/60"
      >
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        Çevirileri {expanded ? 'gizle' : 'göster'}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-sm">
          {languages.map((lang) => (
            <div key={lang.code} className="flex items-center justify-between">
              <span className="text-white/40">{lang.flag} {lang.name}</span>
              <span className={city[`name_${lang.code}`] ? 'text-white' : 'text-red-400'}>
                {city[`name_${lang.code}`] || 'Eksik'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCities;
