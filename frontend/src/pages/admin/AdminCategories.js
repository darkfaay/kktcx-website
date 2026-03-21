import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Tag, Plus, Edit, Trash2, Search, Globe, Check, X, ChevronDown
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

const AdminCategories = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [formData, setFormData] = useState({
    name_tr: '', name_en: '', name_ru: '', name_de: '', name_el: '', 
    slug: '', type: 'service', icon: '', color: '#E91E63'
  });

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  ];

  const categoryTypes = [
    { value: 'service', label: 'Hizmet Türü', color: 'bg-purple-500' },
    { value: 'style', label: 'Stil', color: 'bg-blue-500' },
    { value: 'specialty', label: 'Uzmanlık', color: 'bg-emerald-500' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get(`/categories?lang=${lang}`);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
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
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, formData);
        toast.success('Kategori güncellendi');
      } else {
        await api.post('/admin/categories', formData);
        toast.success('Kategori eklendi');
      }
      closeDialog();
      fetchCategories();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    
    try {
      await api.delete(`/admin/categories/${categoryId}`);
      toast.success('Kategori silindi');
      fetchCategories();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setFormData({
      name_tr: category.name_tr || '',
      name_en: category.name_en || '',
      name_ru: category.name_ru || '',
      name_de: category.name_de || '',
      name_el: category.name_el || '',
      slug: category.slug || '',
      type: category.type || 'service',
      icon: category.icon || '',
      color: category.color || '#E91E63'
    });
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingCategory(null);
    setFormData({
      name_tr: '', name_en: '', name_ru: '', name_de: '', name_el: '', 
      slug: '', type: 'service', icon: '', color: '#E91E63'
    });
  };

  const filteredCategories = categories.filter(cat => 
    !typeFilter || cat.type === typeFilter
  );

  const groupedCategories = categoryTypes.reduce((acc, type) => {
    acc[type.value] = filteredCategories.filter(c => c.type === type.value);
    return acc;
  }, {});

  return (
    <div data-testid="admin-categories">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Kategoriler</h1>
          <p className="text-white/60 mt-1">{categories.length} kategori • 5 dil desteği</p>
        </div>
        <Button className="btn-primary" onClick={() => setShowDialog(true)} data-testid="add-category">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{categories.length}</p>
              <p className="text-white/50 text-xs">Toplam</p>
            </div>
          </div>
        </div>
        {categoryTypes.map((type) => (
          <div key={type.value} className="glass rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${type.color}/20 flex items-center justify-center`}>
                <Tag className={`w-5 h-5 ${type.color.replace('bg-', 'text-')}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {categories.filter(c => c.type === type.value).length}
                </p>
                <p className="text-white/50 text-xs">{type.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex gap-4">
          <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="input-glass w-[200px]">
              <SelectValue placeholder="Tüm Tipler" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151F] border-white/10">
              <SelectItem value="all">Tüm Tipler</SelectItem>
              {categoryTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {categoryTypes.map((type) => {
            const typeCats = groupedCategories[type.value] || [];
            if (typeFilter && typeFilter !== type.value) return null;
            if (typeCats.length === 0) return null;
            
            return (
              <div key={type.value}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${type.color}`}></span>
                  {type.label} ({typeCats.length})
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeCats.map((category) => (
                    <CategoryCard 
                      key={category.id} 
                      category={category} 
                      languages={languages}
                      onEdit={() => openEditDialog(category)}
                      onDelete={() => deleteCategory(category.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="bg-[#15151F] border-white/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Type & Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Tip *</label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                >
                  <SelectTrigger className="input-glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#15151F] border-white/10">
                    {categoryTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">URL Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="input-glass"
                  placeholder="yemek-esligi"
                />
              </div>
            </div>

            {/* Icon & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">İkon (emoji)</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="input-glass"
                  placeholder="🍽️"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Renk</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="input-glass flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Language Names */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#E91E63]" />
                Kategori İsimleri
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
                      placeholder={language.code === 'tr' ? 'Yemek Eşliği' : language.code === 'en' ? 'Dinner Companion' : ''}
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
                {editingCategory ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, languages, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="glass rounded-xl p-5 hover:border-[#E91E63]/30 transition-all" data-testid={`category-${category.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${category.color}20` }}
          >
            {category.icon || '📁'}
          </div>
          <div>
            <h3 className="text-white font-semibold">{category.name_tr}</h3>
            <p className="text-white/40 text-sm">/{category.slug}</p>
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
          const hasTranslation = category[`name_${lang.code}`];
          return (
            <span 
              key={lang.code}
              className={`text-xs px-2 py-1 rounded-full ${
                hasTranslation 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}
              title={hasTranslation ? category[`name_${lang.code}`] : 'Çeviri yok'}
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
              <span className={category[`name_${lang.code}`] ? 'text-white' : 'text-red-400'}>
                {category[`name_${lang.code}`] || 'Eksik'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
