import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { Package, Plus, Edit } from 'lucide-react';
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
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminPackages = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name_tr: '', name_en: '', name_ru: '', name_de: '',
    package_type: 'featured', price: '', duration_days: 30, priority_score: 50
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/packages?lang=${lang}`);
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name_tr || !formData.name_en || !formData.price) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      if (editingPackage) {
        await api.put(`/admin/packages/${editingPackage.id}`, null, {
          params: {
            price: parseFloat(formData.price),
            duration_days: parseInt(formData.duration_days),
            priority_score: parseInt(formData.priority_score),
            name_tr: formData.name_tr,
            name_en: formData.name_en
          }
        });
        toast.success('Paket güncellendi');
      } else {
        await api.post('/admin/packages', {
          ...formData,
          price: parseFloat(formData.price)
        });
        toast.success('Paket eklendi');
      }
      setShowDialog(false);
      setEditingPackage(null);
      setFormData({
        name_tr: '', name_en: '', name_ru: '', name_de: '',
        package_type: 'featured', price: '', duration_days: 30, priority_score: 50
      });
      fetchPackages();
    } catch (error) {
      toast.error(editingPackage ? 'Güncelleme başarısız' : 'Ekleme başarısız');
    }
  };

  const openEditDialog = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name_tr: pkg.name_tr || pkg.name || '',
      name_en: pkg.name_en || pkg.name || '',
      name_ru: pkg.name_ru || '',
      name_de: pkg.name_de || '',
      package_type: pkg.package_type,
      price: pkg.price?.toString() || '',
      duration_days: pkg.duration_days || 30,
      priority_score: pkg.priority_score || 0
    });
    setShowDialog(true);
  };

  const openAddDialog = () => {
    setEditingPackage(null);
    setFormData({
      name_tr: '', name_en: '', name_ru: '', name_de: '',
      package_type: 'featured', price: '', duration_days: 30, priority_score: 50
    });
    setShowDialog(true);
  };

  const packageTypeLabels = {
    standard: 'Standart',
    featured: 'Öne Çıkan',
    city_vitrin: 'Şehir Vitrini',
    homepage_vitrin: 'Ana Sayfa Vitrini',
    premium: 'Premium'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Paketler</h1>
          <p className="text-white/60 mt-1">{packages.length} paket</p>
        </div>
        <Button className="btn-primary" onClick={openAddDialog} data-testid="add-package">
          <Plus className="w-4 h-4 mr-2" />
          Paket Ekle
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="glass rounded-xl p-6" data-testid={`package-${pkg.id}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{pkg.name}</h3>
                  <p className="text-white/50 text-sm">{packageTypeLabels[pkg.package_type]}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(pkg)}
                className="text-[#D4AF37] hover:text-[#D4AF37]/80"
                data-testid={`edit-package-${pkg.id}`}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Fiyat:</span>
                <span className="text-[#D4AF37] font-semibold">${pkg.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Süre:</span>
                <span className="text-white">{pkg.duration_days} gün</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Öncelik:</span>
                <span className="text-white">{pkg.priority_score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#0F0F10] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingPackage ? 'Paket Düzenle' : 'Yeni Paket Ekle'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Türkçe İsim *</label>
              <Input
                value={formData.name_tr}
                onChange={(e) => setFormData(prev => ({ ...prev, name_tr: e.target.value }))}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">İngilizce İsim *</label>
              <Input
                value={formData.name_en}
                onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Paket Tipi *</label>
              <Select 
                value={formData.package_type} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, package_type: v }))}
              >
                <SelectTrigger className="input-glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F10] border-white/10">
                  <SelectItem value="featured">Öne Çıkan</SelectItem>
                  <SelectItem value="city_vitrin">Şehir Vitrini</SelectItem>
                  <SelectItem value="homepage_vitrin">Ana Sayfa Vitrini</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Fiyat (USD) *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Süre (Gün)</label>
              <Input
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                className="input-glass"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Öncelik Puanı</label>
              <Input
                type="number"
                value={formData.priority_score}
                onChange={(e) => setFormData(prev => ({ ...prev, priority_score: parseInt(e.target.value) }))}
                className="input-glass"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowDialog(false)}>
                İptal
              </Button>
              <Button className="btn-primary" onClick={handleSubmit}>
                {editingPackage ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPackages;
