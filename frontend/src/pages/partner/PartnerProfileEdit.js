import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Save, Send, MapPin, Globe, User, Heart, Sparkles, Phone, 
  Check, ChevronRight, ChevronLeft, Camera, Ruler, Eye, 
  Palette, Users, Crown, Clock, Home, Car, MessageCircle
} from 'lucide-react';
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
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Service type options with icons
const serviceTypeOptions = [
  { value: 'dinner-companion', label: 'Yemek Eşliği', icon: '🍽️' },
  { value: 'event-companion', label: 'Davet Eşliği', icon: '🎉' },
  { value: 'sleep-companion', label: 'Uyku Arkadaşlığı', icon: '🌙' },
  { value: 'gf-bf-experience', label: 'Sevgili Deneyimi', icon: '💑' },
  { value: 'spouse-roleplay', label: 'Eş Rolleri', icon: '💍' },
  { value: 'travel-companion', label: 'Gezi Eşliği', icon: '✈️' },
  { value: 'social-event', label: 'Sosyal Etkinlik', icon: '🎭' },
  { value: 'business-event', label: 'İş Daveti', icon: '💼' },
  { value: 'culture-arts', label: 'Kültür & Sanat', icon: '🎨' },
  { value: 'sports-fitness', label: 'Spor & Fitness', icon: '🏋️' },
];

const orientationOptions = [
  { value: 'heterosexual', label: 'Heteroseksüel' },
  { value: 'lesbian', label: 'Lezbiyen' },
  { value: 'gay', label: 'Gay' },
  { value: 'bisexual', label: 'Biseksüel' },
  { value: 'trans', label: 'Trans' },
];

const genderOptions = [
  { value: 'female', label: 'Kadın', icon: '👩' },
  { value: 'male', label: 'Erkek', icon: '👨' },
  { value: 'trans', label: 'Trans', icon: '🌈' },
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
  { value: 'african', label: 'Afrikalı' },
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

const languageOptions = [
  { value: 'Türkçe', label: 'Türkçe', flag: '🇹🇷' },
  { value: 'İngilizce', label: 'İngilizce', flag: '🇬🇧' },
  { value: 'Rumca', label: 'Rumca', flag: '🇬🇷' },
  { value: 'Rusça', label: 'Rusça', flag: '🇷🇺' },
  { value: 'Almanca', label: 'Almanca', flag: '🇩🇪' },
  { value: 'Arapça', label: 'Arapça', flag: '🇸🇦' },
  { value: 'Fransızca', label: 'Fransızca', flag: '🇫🇷' },
];

const steps = [
  { id: 1, title: 'Temel Bilgiler', icon: User, desc: 'Kim olduğunuzu tanıtın' },
  { id: 2, title: 'Hizmetler', icon: Sparkles, desc: 'Sunduğunuz hizmetler' },
  { id: 3, title: 'Görünüm', icon: Eye, desc: 'Fiziksel özellikleriniz' },
  { id: 4, title: 'Detaylar', icon: Heart, desc: 'Fiyat ve iletişim' },
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
  const [currentStep, setCurrentStep] = useState(1);

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
      const response = await axios.get(`${API_URL}/api/cities/${cityId}/districts`);
      setDistricts(response.data);
    } catch (error) {
      setDistricts([]);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        age: parseInt(formData.age) || 18,
        height: parseInt(formData.height) || null,
        hourly_rate: parseFloat(formData.hourly_rate) || null
      };

      if (profile) {
        await api.put('/partner/profile', dataToSend);
      } else {
        await api.post('/partner/profile', dataToSend);
      }
      toast.success('Profil kaydedildi');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nickname || !formData.age || formData.service_types.length === 0) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        ...formData,
        age: parseInt(formData.age) || 18,
        height: parseInt(formData.height) || null,
        hourly_rate: parseFloat(formData.hourly_rate) || null
      };

      if (profile) {
        await api.put('/partner/profile', dataToSend);
      } else {
        await api.post('/partner/profile', dataToSend);
      }
      
      await api.post('/partner/submit-for-review');
      toast.success('Profiliniz onaya gönderildi!');
      navigate(`/${lang}/partner`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const getStepProgress = () => {
    let filled = 0;
    let total = 0;
    
    // Step 1: Basic
    if (formData.nickname) filled++;
    if (formData.age) filled++;
    if (formData.city_id) filled++;
    total += 3;
    
    // Step 2: Services
    if (formData.service_types.length > 0) filled++;
    total += 1;
    
    // Step 3: Appearance
    if (formData.height) filled++;
    if (formData.body_type) filled++;
    total += 2;
    
    // Step 4: Details
    if (formData.short_description) filled++;
    total += 1;
    
    return Math.round((filled / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="animate-spin w-16 h-16 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" data-testid="partner-profile-edit">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#997B19] flex items-center justify-center">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">
              {profile ? 'Profili Düzenle' : 'Partner Profilinizi Oluşturun'}
            </h1>
            <p className="text-white/50 text-sm">Adım {currentStep}/4 - {steps[currentStep - 1].desc}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-sm">Profil Tamamlanma</span>
            <span className="text-[#D4AF37] font-semibold">{getStepProgress()}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] transition-all duration-500"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="glass rounded-2xl p-4 mb-8 hidden md:block">
        <div className="flex justify-between">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all flex-1 ${
                currentStep === step.id 
                  ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/50' 
                  : 'hover:bg-white/5'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                currentStep === step.id 
                  ? 'bg-[#D4AF37] text-black' 
                  : currentStep > step.id 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-white/10 text-white/40'
              }`}>
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="text-left hidden lg:block">
                <p className={`font-medium ${currentStep === step.id ? 'text-[#D4AF37]' : 'text-white/70'}`}>
                  {step.title}
                </p>
                <p className="text-white/40 text-xs">{step.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Identity Card */}
            <div className="glass-gold rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-2xl"></div>
              
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#D4AF37]" />
                </div>
                Kimlik Bilgileri
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="text-white/70 text-sm mb-2 block font-medium">
                    Takma Adınız <span className="text-[#D4AF37]">*</span>
                  </label>
                  <Input
                    value={formData.nickname}
                    onChange={(e) => handleChange('nickname', e.target.value)}
                    placeholder="Profilinizde görünecek isim"
                    className="bg-white/5 border-white/10 focus:border-[#D4AF37] h-12 text-white"
                    data-testid="profile-nickname"
                  />
                </div>
                
                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">
                    Yaşınız <span className="text-[#D4AF37]">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    placeholder="18-99"
                    min={18}
                    max={99}
                    className="bg-white/5 border-white/10 focus:border-[#D4AF37] h-12 text-white"
                    data-testid="profile-age"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">
                    Cinsiyet <span className="text-[#D4AF37]">*</span>
                  </label>
                  <div className="flex gap-2">
                    {genderOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleChange('gender', opt.value)}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          formData.gender === opt.value
                            ? 'bg-[#D4AF37] text-black'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        <span>{opt.icon}</span>
                        <span className="hidden sm:inline">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                Konum Bilgileri
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">
                    Şehir <span className="text-[#D4AF37]">*</span>
                  </label>
                  <Select value={formData.city_id} onValueChange={(v) => handleChange('city_id', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12">
                      <SelectValue placeholder="Şehir seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">Bölge / Semt</label>
                  <Select 
                    value={formData.district_id} 
                    onValueChange={(v) => handleChange('district_id', v)}
                    disabled={!formData.city_id || districts.length === 0}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 h-12">
                      <SelectValue placeholder="Bölge seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
                      {districts.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Languages Card */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                Konuştuğunuz Diller
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleArrayItem('languages', opt.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                      formData.languages.includes(opt.value)
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                    {formData.languages.includes(opt.value) && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Service Types */}
            <div className="glass-gold rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-3xl"></div>
              
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                </div>
                Sunduğunuz Hizmetler
              </h3>
              <p className="text-white/50 text-sm mb-6">En az bir hizmet türü seçin</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {serviceTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleArrayItem('service_types', opt.value)}
                    className={`p-4 rounded-xl text-center transition-all duration-300 group ${
                      formData.service_types.includes(opt.value)
                        ? 'bg-gradient-to-br from-[#D4AF37] to-[#997B19] shadow-lg shadow-[#D4AF37]/30'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-[#D4AF37]/30'
                    }`}
                    data-testid={`service-${opt.value}`}
                  >
                    <span className="text-2xl mb-2 block">{opt.icon}</span>
                    <span className={`text-sm font-medium ${
                      formData.service_types.includes(opt.value) ? 'text-black' : 'text-white/70'
                    }`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Orientations */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-400" />
                </div>
                Cinsel Yönelim
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {orientationOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleArrayItem('orientations', opt.value)}
                    className={`px-5 py-3 rounded-xl font-medium transition-all ${
                      formData.orientations.includes(opt.value)
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                Müsaitlik Durumu
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                  formData.is_available_today ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-white/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">☀️</div>
                    <div>
                      <p className="text-white font-medium">Bugün Müsaitim</p>
                      <p className="text-white/50 text-sm">Gün içinde randevu alabilirim</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_available_today}
                    onCheckedChange={(v) => handleChange('is_available_today', v)}
                  />
                </div>

                <div className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                  formData.is_available_tonight ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-white/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🌙</div>
                    <div>
                      <p className="text-white font-medium">Bu Akşam Müsaitim</p>
                      <p className="text-white/50 text-sm">Akşam randevuları için</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_available_tonight}
                    onCheckedChange={(v) => handleChange('is_available_tonight', v)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Appearance */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-gold rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-2xl"></div>
              
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-[#D4AF37]" />
                </div>
                Fiziksel Özellikler
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Boy (cm)
                  </label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="170"
                    className="bg-white/5 border-white/10 focus:border-[#D4AF37] h-12"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">Vücut Tipi</label>
                  <Select value={formData.body_type} onValueChange={(v) => handleChange('body_type', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
                      {bodyTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">Saç Rengi</label>
                  <Select value={formData.hair_color} onValueChange={(v) => handleChange('hair_color', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
                      {hairColorOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">Göz Rengi</label>
                  <Select value={formData.eye_color} onValueChange={(v) => handleChange('eye_color', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
                      {eyeColorOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">Etnik Köken</label>
                  <Select value={formData.ethnicity} onValueChange={(v) => handleChange('ethnicity', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
                      {ethnicityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">Ten Rengi</label>
                  <Select value={formData.skin_tone} onValueChange={(v) => handleChange('skin_tone', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-12">
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15151F] border-[#D4AF37]/20">
                      {skinToneOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Description */}
            <div className="glass-gold rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-full blur-2xl"></div>
              
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#D4AF37]" />
                </div>
                Kendinizi Tanıtın
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">
                    Kısa Açıklama <span className="text-[#D4AF37]">*</span>
                  </label>
                  <Textarea
                    value={formData.short_description}
                    onChange={(e) => handleChange('short_description', e.target.value)}
                    placeholder="Profil kartlarında görünecek kısa tanıtım (100 karakter)"
                    maxLength={100}
                    className="bg-white/5 border-white/10 focus:border-[#D4AF37] min-h-[80px] resize-none"
                  />
                  <p className="text-white/40 text-xs mt-1 text-right">{formData.short_description.length}/100</p>
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">Detaylı Açıklama</label>
                  <Textarea
                    value={formData.detailed_description}
                    onChange={(e) => handleChange('detailed_description', e.target.value)}
                    placeholder="Profil sayfanızda görünecek detaylı tanıtım metni..."
                    className="bg-white/5 border-white/10 focus:border-[#D4AF37] min-h-[150px]"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Location */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-emerald-400" />
                </div>
                Fiyat & Hizmet Yeri
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium">Saatlik Ücret ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] font-bold">$</span>
                    <Input
                      type="number"
                      value={formData.hourly_rate}
                      onChange={(e) => handleChange('hourly_rate', e.target.value)}
                      placeholder="150"
                      className="bg-white/5 border-white/10 focus:border-[#D4AF37] h-12 pl-10"
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-xl flex items-center justify-between ${
                  formData.incall ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-white/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-white font-medium">Ev (Incall)</p>
                      <p className="text-white/50 text-xs">Evimde ağırlayabilirim</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.incall}
                    onCheckedChange={(v) => handleChange('incall', v)}
                  />
                </div>

                <div className={`p-4 rounded-xl flex items-center justify-between ${
                  formData.outcall ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-white/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Dışarı (Outcall)</p>
                      <p className="text-white/50 text-xs">Size gelebilirim</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.outcall}
                    onCheckedChange={(v) => handleChange('outcall', v)}
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                </div>
                İletişim Bilgileri
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    WhatsApp
                  </label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="bg-white/5 border-white/10 focus:border-emerald-500 h-12"
                  />
                </div>

                <div>
                  <label className="text-white/70 text-sm mb-2 block font-medium flex items-center gap-2">
                    <span className="text-xl">✈️</span>
                    Telegram
                  </label>
                  <Input
                    value={formData.telegram}
                    onChange={(e) => handleChange('telegram', e.target.value)}
                    placeholder="@kullaniciadi"
                    className="bg-white/5 border-white/10 focus:border-blue-500 h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 sm:flex-none border-white/20 text-white hover:bg-white/10 h-12"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Önceki
            </Button>
          )}
          
          <div className="flex-1" />
          
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving}
            className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 h-12"
          >
            <Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-semibold h-12"
            >
              Sonraki
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] hover:from-[#F3E5AB] hover:to-[#D4AF37] text-black font-semibold h-12 px-8"
            >
              <Send className="w-4 h-4 mr-2" />
              {saving ? 'Gönderiliyor...' : 'Onaya Gönder'}
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PartnerProfileEdit;
