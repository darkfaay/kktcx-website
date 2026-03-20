import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Save, Send, MapPin, Calendar, Globe, Tag, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PartnerProfileEdit = () => {
  const { user, api } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nickname: '',
    age: '',
    city_id: '',
    district_id: '',
    languages: [],
    category_ids: [],
    short_description: '',
    detailed_description: '',
    is_available_today: false,
    is_available_tonight: false
  });

  const languageOptions = [
    { value: 'Türkçe', label: 'Türkçe' },
    { value: 'İngilizce', label: 'İngilizce' },
    { value: 'Rusça', label: 'Rusça' },
    { value: 'Almanca', label: 'Almanca' },
    { value: 'Arapça', label: 'Arapça' },
    { value: 'Fransızca', label: 'Fransızca' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.city_id) {
      fetchDistricts(formData.city_id);
    }
  }, [formData.city_id]);

  const fetchData = async () => {
    try {
      const [citiesRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/cities?lang=${lang}`),
        axios.get(`${API_URL}/api/categories?lang=${lang}`)
      ]);
      setCities(citiesRes.data);
      setCategories(categoriesRes.data);

      // Try to fetch existing profile
      try {
        const profileRes = await api.get('/partner/profile');
        setProfile(profileRes.data);
        setFormData({
          nickname: profileRes.data.nickname || '',
          age: profileRes.data.age || '',
          city_id: profileRes.data.city_id || '',
          district_id: profileRes.data.district_id || '',
          languages: profileRes.data.languages || [],
          category_ids: profileRes.data.category_ids || [],
          short_description: profileRes.data.short_description || '',
          detailed_description: profileRes.data.detailed_description || '',
          is_available_today: profileRes.data.is_available_today || false,
          is_available_tonight: profileRes.data.is_available_tonight || false
        });
        if (profileRes.data.city_id) {
          fetchDistricts(profileRes.data.city_id);
        }
      } catch (e) {
        // No profile exists yet
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (cityId) => {
    try {
      const response = await axios.get(`${API_URL}/api/cities/${cityId}/districts?lang=${lang}`);
      setDistricts(response.data);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const toggleCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(c => c !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  const handleSave = async () => {
    if (!formData.nickname || !formData.age || !formData.city_id) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    setSaving(true);
    try {
      if (profile) {
        await api.put('/partner/profile', formData);
        toast.success('Profil güncellendi');
      } else {
        await api.post('/partner/profile', formData);
        toast.success('Profil oluşturuldu');
      }
      navigate(`/${lang}/partner`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!formData.nickname || !formData.age || !formData.city_id || !formData.short_description) {
      toast.error('Onaya göndermek için tüm zorunlu alanları doldurun');
      return;
    }

    setSaving(true);
    try {
      // First save
      if (profile) {
        await api.put('/partner/profile', formData);
      } else {
        await api.post('/partner/profile', formData);
      }
      
      // Then submit for review
      await api.post('/partner/submit-for-review');
      toast.success('Profiliniz onaya gönderildi');
      navigate(`/${lang}/partner`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">
            {profile ? 'Profili Düzenle' : 'Profil Oluştur'}
          </h1>
          <p className="text-white/60 mt-1">Bilgilerinizi eksiksiz doldurun</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-[#D4AF37]" />
            Temel Bilgiler
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('nickname')} *</label>
              <Input
                value={formData.nickname}
                onChange={(e) => handleChange('nickname', e.target.value)}
                placeholder="Profilinizde görünecek isim"
                className="input-glass"
                data-testid="profile-nickname"
              />
            </div>
            
            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('age')} *</label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value) || '')}
                placeholder="Yaşınız"
                min={18}
                max={99}
                className="input-glass"
                data-testid="profile-age"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#D4AF37]" />
            Konum
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('city')} *</label>
              <Select 
                value={formData.city_id} 
                onValueChange={(v) => handleChange('city_id', v)}
              >
                <SelectTrigger className="input-glass" data-testid="profile-city">
                  <SelectValue placeholder="Şehir seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F10] border-white/10">
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-white/70 text-sm mb-2 block">Bölge</label>
              <Select 
                value={formData.district_id} 
                onValueChange={(v) => handleChange('district_id', v)}
                disabled={!formData.city_id || districts.length === 0}
              >
                <SelectTrigger className="input-glass" data-testid="profile-district">
                  <SelectValue placeholder="Bölge seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F10] border-white/10">
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#D4AF37]" />
            Konuştuğunuz Diller
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {languageOptions.map((lng) => (
              <label
                key={lng.value}
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                  formData.languages.includes(lng.value)
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <Checkbox
                  checked={formData.languages.includes(lng.value)}
                  onCheckedChange={() => toggleLanguage(lng.value)}
                  className="hidden"
                />
                {lng.label}
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#D4AF37]" />
            Hizmet Kategorileri
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                  formData.category_ids.includes(cat.id)
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <Checkbox
                  checked={formData.category_ids.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                  className="hidden"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D4AF37]" />
            Müsaitlik
          </h3>
          
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={formData.is_available_today}
                onCheckedChange={(v) => handleChange('is_available_today', v)}
              />
              <span className="text-white/70">{t('availableToday')}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={formData.is_available_tonight}
                onCheckedChange={(v) => handleChange('is_available_tonight', v)}
              />
              <span className="text-white/70">{t('availableTonight')}</span>
            </label>
          </div>
        </div>

        {/* Descriptions */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6">{t('description')}</h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('shortDescription')} *</label>
              <Textarea
                value={formData.short_description}
                onChange={(e) => handleChange('short_description', e.target.value)}
                placeholder="Kısa bir tanıtım yazısı (max 200 karakter)"
                maxLength={200}
                rows={3}
                className="input-glass resize-none"
                data-testid="profile-short-desc"
              />
              <p className="text-white/40 text-xs mt-1">{formData.short_description.length}/200</p>
            </div>
            
            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('detailedDescription')}</label>
              <Textarea
                value={formData.detailed_description}
                onChange={(e) => handleChange('detailed_description', e.target.value)}
                placeholder="Kendinizi detaylı tanıtın..."
                rows={6}
                className="input-glass resize-none"
                data-testid="profile-detailed-desc"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleSave}
            variant="outline"
            className="btn-outline flex-1 py-6"
            disabled={saving}
            data-testid="save-profile"
          >
            <Save className="w-5 h-5 mr-2" />
            Taslak Kaydet
          </Button>
          
          <Button 
            onClick={handleSubmitForReview}
            className="btn-primary flex-1 py-6"
            disabled={saving || (profile?.status === 'pending')}
            data-testid="submit-profile"
          >
            <Send className="w-5 h-5 mr-2" />
            {profile?.status === 'pending' ? 'İnceleniyor' : 'Onaya Gönder'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PartnerProfileEdit;
