import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Tag, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner';

const AdminCategories = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    name_tr: '', name_en: '', name_ru: '', name_de: '', slug: '', icon: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get(`/categories?lang=${lang}`);
      setCategories(response.data);
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
      await api.post('/admin/categories', formData);
      toast.success('Kategori eklendi');
      setShowDialog(false);
      setFormData({ name_tr: '', name_en: '', name_ru: '', name_de: '', slug: '', icon: '' });
      fetchCategories();
    } catch (error) {
      toast.error('Ekleme başarısız');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Kategoriler</h1>
          <p className="text-white/60 mt-1">{categories.length} kategori</p>
        </div>
        <Button className="btn-primary" onClick={() => setShowDialog(true)} data-testid="add-category">
          <Plus className="w-4 h-4 mr-2" />
          Kategori Ekle
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="glass rounded-xl p-6" data-testid={`category-${cat.id}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{cat.name}</h3>
                  <p className="text-white/50 text-sm">/{cat.slug}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-white/40">
              <p>TR: {cat.name_tr}</p>
              <p>EN: {cat.name_en}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0F0F10] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Yeni Kategori Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Türkçe İsim *</label>
              <Input
                value={formData.name_tr}
                onChange={(e) => setFormData(prev => ({ ...prev, name_tr: e.target.value }))}
                className="input-glass"
                placeholder="Akşam Yemeği"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">İngilizce İsim *</label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                className="input-glass"
                placeholder="Dinner Date"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Rusça İsim</label>
              <Input
                value={formData.name_ru}
                onChange={(e) => setFormData(prev => ({ ...prev, name_ru: e.target.value }))}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Almanca İsim</label>
              <Input
                value={formData.name_de}
                onChange={(e) => setFormData(prev => ({ ...prev, name_de: e.target.value }))}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Slug *</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="input-glass"
                placeholder="dinner-date"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDialog(false)}>
                İptal
              </Button>
              <Button className="btn-primary" onClick={handleSubmit}>
                Ekle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
