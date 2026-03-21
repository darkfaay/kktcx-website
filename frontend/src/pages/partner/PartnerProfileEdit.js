import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Save, Send, MapPin, Calendar, Globe, Tag, User, Heart, Sparkles, Phone } from 'lucide-react';
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

// New legal service types
const serviceTypeOptions = [
  { value: 'dinner-companion', label: 'Yemek Eşliği' },
  { value: 'event-companion', label: 'Davet Eşliği' },
  { value: 'sleep-companion', label: 'Uyku Arkadaşlığı' },
  { value: 'gf-bf-experience', label: 'Sevgili Deneyimi' },
  { value: 'spouse-roleplay', label: 'Eş Rolleri' },
  { value: 'travel-companion', label: 'Gezi Eşliği' },
  { value: 'social-event', label: 'Sosyal Etkinlik' },
  { value: 'business-event', label: 'İş Daveti' },
  { value: 'culture-arts', label: 'Kültür & Sanat' },
  { value: 'sports-fitness', label: 'Spor & Fitness' },
];

const orientationOptions = [
  { value: 'heterosexual', label: 'Heteroseksüel' },
  { value: 'lesbian', label: 'Lezbiyen' },
  { value: 'gay', label: 'Gay' },
  { value: 'bisexual', label: 'Biseksüel' },
  { value: 'trans', label: 'Trans' },
];

const genderOptions = [
  { value: 'female', label: 'Kadın' },
  { value: 'male', label: 'Erkek' },
  { value: 'trans', label: 'Trans' },
];

const bodyTypeOptions = [
  { value: 'slim', label: 'İnce' },
  { value: 'athletic', label: 'Atletik' },
  { value: 'curvy', label: 'Dolgun' },
  { value: 'plus-size', label: 'Büyük Beden' },
];

const hairColorOptions = [
  { value: 'black', label: 'Siyah' },
  { value: 'brown', label: 'Kahverengi' },
  { value: 'blonde', label: 'Sarı' },
  { value: 'red', label: 'Kızıl' },
  { value: 'other', label: 'Diğer' },
];

const eyeColorOptions = [
  { value: 'brown', label: 'Kahverengi' },
  { value: 'blue', label: 'Mavi' },
  { value: 'green', label: 'Yeşil' },
  { value: 'hazel', label: 'Ela' },
  { value: 'other', label: 'Diğer' },
];

const ethnicityOptions = [
  { value: 'caucasian', label: 'Beyaz / Kafkas' },
  { value: 'african', label: 'Afrikalı / Siyahi' },
  { value: 'asian', label: 'Asyalı' },
  { value: 'latin', label: 'Latin' },
  { value: 'middle-eastern', label: 'Orta Doğulu' },
  { value: 'mixed', label: 'Karışık' },
  { value: 'other', label: 'Diğer' },
];

const skinToneOptions = [
  { value: 'fair', label: 'Açık Ten' },
  { value: 'light', label: 'Beyaz' },
  { value: 'medium', label: 'Buğday' },
  { value: 'olive', label: 'Esmer' },
  { value: 'tan', label: 'Bronz' },
  { value: 'brown', label: 'Kahverengi' },
  { value: 'dark', label: 'Koyu' },
];

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
    gender: 'female',
    city_id: '',
    district_id: '',
    languages: [],
    category_ids: [],
    service_types: [],
    orientations: [],
    body_type: '',
    height: '',
    hair_color: '',
    eye_color: '',
    ethnicity: '',
    skin_tone: '',
    short_description: '',
    detailed_description: '',
    hourly_rate: '',
    incall: false,
    outcall: false,
    whatsapp: '',
    telegram: '',
    is_available_today: false,
    is_available_tonight: false
  });

  const languageOptions = [
    { value: 'Türkçe', label: 'Türkçe' },
    { value: 'İngilizce', label: 'İngilizce' },
    { value: 'Rumca', label: 'Rumca (Yunanca)' },
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
          gender: profileRes.data.gender || 'female',
          city_id: profileRes.data.city_id || '',
          district_id: profileRes.data.district_id || '',
          languages: profileRes.data.languages || [],
          category_ids: profileRes.data.category_ids || [],
          service_types: profileRes.data.service_types || [],
          orientations: profileRes.data.orientations || [],
          body_type: profileRes.data.body_type || '',
          height: profileRes.data.height || '',
          hair_color: profileRes.data.hair_color || '',
          eye_color: profileRes.data.eye_color || '',
          ethnicity: profileRes.data.ethnicity || '',
          skin_tone: profileRes.data.skin_tone || '',
          short_description: profileRes.data.short_description || '',
          detailed_description: profileRes.data.detailed_description || '',
          hourly_rate: profileRes.data.hourly_rate || '',
          incall: profileRes.data.incall || false,
          outcall: profileRes.data.outcall || false,
          whatsapp: profileRes.data.whatsapp || '',
          telegram: profileRes.data.telegram || '',
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

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleSave = async () => {
    if (!formData.nickname || !formData.age || !formData.city_id) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        age: parseInt(formData.age),
        height: formData.height ? parseInt(formData.height) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      };

      if (profile) {
        await api.put('/partner/profile', dataToSend);
        toast.success('Profil güncellendi');
      } else {
        await api.post('/partner/profile', dataToSend);
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
      const dataToSend = {
        ...formData,
        age: parseInt(formData.age),
        height: formData.height ? parseInt(formData.height) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      };

      // First save
      if (profile) {
        await api.put('/partner/profile', dataToSend);
      } else {
        await api.post('/partner/profile', dataToSend);
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
        <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full"></div>
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
            <User className="w-5 h-5 text-[#E91E63]" />
            Temel Bilgiler
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
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
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="Yaşınız"
                min={18}
                max={99}
                className="input-glass"
                data-testid="profile-age"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Cinsiyet *</label>
              <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                <SelectTrigger className="input-glass" data-testid="profile-gender">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  {genderOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Service Types & Orientations */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E91E63]" />
            Hizmet Türü & Yönelim
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-white/70 text-sm mb-3 block">Hizmet Türleri *</label>
              <div className="flex flex-wrap gap-3">
                {serviceTypeOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                      formData.service_types.includes(opt.value)
                        ? 'bg-[#E91E63] text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                    data-testid={`service-${opt.value}`}
                  >
                    <Checkbox
                      checked={formData.service_types.includes(opt.value)}
                      onCheckedChange={() => toggleArrayItem('service_types', opt.value)}
                      className="hidden"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-3 block">Cinsel Yönelim</label>
              <div className="flex flex-wrap gap-3">
                {orientationOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                      formData.orientations.includes(opt.value)
                        ? 'bg-[#9C27B0] text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                    data-testid={`orientation-${opt.value}`}
                  >
                    <Checkbox
                      checked={formData.orientations.includes(opt.value)}
                      onCheckedChange={() => toggleArrayItem('orientations', opt.value)}
                      className="hidden"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Physical Attributes */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#E91E63]" />
            Fiziksel Özellikler
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Vücut Tipi</label>
              <Select value={formData.body_type || "none"} onValueChange={(v) => handleChange('body_type', v === "none" ? "" : v)}>
                <SelectTrigger className="input-glass" data-testid="profile-body-type">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  <SelectItem value="none">Seçin</SelectItem>
                  {bodyTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Boy (cm)</label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                placeholder="170"
                min={140}
                max={220}
                className="input-glass"
                data-testid="profile-height"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Saç Rengi</label>
              <Select value={formData.hair_color || "none"} onValueChange={(v) => handleChange('hair_color', v === "none" ? "" : v)}>
                <SelectTrigger className="input-glass" data-testid="profile-hair">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  <SelectItem value="none">Seçin</SelectItem>
                  {hairColorOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Göz Rengi</label>
              <Select value={formData.eye_color || "none"} onValueChange={(v) => handleChange('eye_color', v === "none" ? "" : v)}>
                <SelectTrigger className="input-glass" data-testid="profile-eyes">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  <SelectItem value="none">Seçin</SelectItem>
                  {eyeColorOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second Row - Ethnicity & Skin Tone */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Etnik Köken</label>
              <Select value={formData.ethnicity || "none"} onValueChange={(v) => handleChange('ethnicity', v === "none" ? "" : v)}>
                <SelectTrigger className="input-glass" data-testid="profile-ethnicity">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  <SelectItem value="none">Seçin</SelectItem>
                  {ethnicityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Ten Rengi</label>
              <Select value={formData.skin_tone || "none"} onValueChange={(v) => handleChange('skin_tone', v === "none" ? "" : v)}>
                <SelectTrigger className="input-glass" data-testid="profile-skin-tone">
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  <SelectItem value="none">Seçin</SelectItem>
                  {skinToneOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#E91E63]" />
            Konum
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">{t('city')} *</label>
              <Select 
                value={formData.city_id || "none"} 
                onValueChange={(v) => handleChange('city_id', v === "none" ? "" : v)}
              >
                <SelectTrigger className="input-glass" data-testid="profile-city">
                  <SelectValue placeholder="Şehir seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  <SelectItem value="none">Şehir seçin</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-white/70 text-sm mb-2 block">Bölge</label>
              <Select 
                value={formData.district_id || "none"} 
                onValueChange={(v) => handleChange('district_id', v === "none" ? "" : v)}
                disabled={!formData.city_id || districts.length === 0}
              >
                <SelectTrigger className="input-glass" data-testid="profile-district">
                  <SelectValue placeholder="Bölge seçin" />
                </SelectTrigger>
                <SelectContent className="bg-[#15151F] border-[#E91E63]/20">
                  <SelectItem value="none">Bölge seçin</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>{district.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Pricing & Service Type */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#E91E63]" />
            Fiyat & Hizmet Yeri
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Saatlik Ücret ($)</label>
              <Input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => handleChange('hourly_rate', e.target.value)}
                placeholder="100"
                min={0}
                className="input-glass"
                data-testid="profile-rate"
              />
            </div>

            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.incall}
                  onCheckedChange={(v) => handleChange('incall', v)}
                  data-testid="profile-incall"
                />
                <span className="text-white/70">Ev (Incall)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.outcall}
                  onCheckedChange={(v) => handleChange('outcall', v)}
                  data-testid="profile-outcall"
                />
                <span className="text-white/70">Dışarı (Outcall)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#E91E63]" />
            İletişim (Opsiyonel)
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-white/70 text-sm mb-2 block">WhatsApp</label>
              <Input
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                className="input-glass"
                data-testid="profile-whatsapp"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Telegram</label>
              <Input
                value={formData.telegram}
                onChange={(e) => handleChange('telegram', e.target.value)}
                placeholder="@username"
                className="input-glass"
                data-testid="profile-telegram"
              />
            </div>
          </div>
        </div>

        {/* Languages */}
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#E91E63]" />
            Konuştuğunuz Diller
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {languageOptions.map((lng) => (
              <label
                key={lng.value}
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                  formData.languages.includes(lng.value)
                    ? 'bg-[#E91E63] text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <Checkbox
                  checked={formData.languages.includes(lng.value)}
                  onCheckedChange={() => toggleArrayItem('languages', lng.value)}
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
            <Tag className="w-5 h-5 text-[#E91E63]" />
            Hizmet Kategorileri
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${
                  formData.category_ids.includes(cat.id)
                    ? 'bg-[#E91E63] text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <Checkbox
                  checked={formData.category_ids.includes(cat.id)}
                  onCheckedChange={() => toggleArrayItem('category_ids', cat.id)}
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
            <Calendar className="w-5 h-5 text-[#E91E63]" />
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
