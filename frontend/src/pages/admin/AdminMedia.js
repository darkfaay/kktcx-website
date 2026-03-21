import React, { useState, useEffect } from 'react';
import { useAuth, useLanguage } from '../../context/AppContext';
import { 
  Image, Upload, Trash2, Search, Filter, Grid, List,
  Download, Eye, Copy, Check, X, Folder, File, HardDrive,
  MoreVertical, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminMedia = () => {
  const { api } = useAuth();
  const { lang } = useLanguage();
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [typeFilter]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await api.get(`/admin/media?${params.toString()}`);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      // Mock data for demo
      setFiles([
        { id: '1', filename: 'profile_1.jpg', type: 'image', size: 245000, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', created_at: new Date().toISOString() },
        { id: '2', filename: 'profile_2.jpg', type: 'image', size: 189000, url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', created_at: new Date().toISOString() },
        { id: '3', filename: 'banner.jpg', type: 'image', size: 512000, url: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400', created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles?.length) return;

    setUploading(true);
    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        await api.post('/admin/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      toast.success(`${uploadFiles.length} dosya yüklendi`);
      fetchFiles();
    } catch (error) {
      toast.error('Yükleme başarısız');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId) => {
    if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;
    
    try {
      await api.delete(`/admin/media/${fileId}`);
      toast.success('Dosya silindi');
      fetchFiles();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const copyUrl = (file) => {
    const url = file.url || `${API_URL}/api/files/${file.path}`;
    navigator.clipboard.writeText(url);
    setCopiedId(file.id);
    toast.success('URL kopyalandı');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image')) return Image;
    return File;
  };

  const stats = {
    total: files.length,
    images: files.filter(f => f.type?.includes('image')).length,
    totalSize: files.reduce((acc, f) => acc + (f.size || 0), 0),
  };

  return (
    <div data-testid="admin-media">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-serif">Medya Yönetimi</h1>
          <p className="text-white/60 mt-1">Dosya ve görsel yönetimi</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="upload-input"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <Button 
            className="btn-primary" 
            onClick={() => document.getElementById('upload-input').click()}
            disabled={uploading}
          >
            {uploading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Dosya Yükle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Folder className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-white/50 text-xs">Toplam Dosya</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Image className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.images}</p>
              <p className="text-white/50 text-xs">Görsel</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatSize(stats.totalSize)}</p>
              <p className="text-white/50 text-xs">Toplam Boyut</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E91E63]/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#E91E63]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">∞</p>
              <p className="text-white/50 text-xs">Kalan Alan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 w-full md:w-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Dosya adı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchFiles()}
                className="input-glass pl-10"
              />
            </div>
            <Select value={typeFilter || "all"} onValueChange={(v) => setTypeFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="input-glass w-[150px]">
                <Filter className="w-4 h-4 mr-2 text-white/40" />
                <SelectValue placeholder="Tüm Tipler" />
              </SelectTrigger>
              <SelectContent className="bg-[#15151F] border-white/10">
                <SelectItem value="all">Tüm Tipler</SelectItem>
                <SelectItem value="image">Görseller</SelectItem>
                <SelectItem value="video">Videolar</SelectItem>
                <SelectItem value="document">Dokümanlar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-[#E91E63]' : 'text-white/60'}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-[#E91E63]' : 'text-white/60'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Files List */}
      {loading ? (
        <div className="glass rounded-xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#E91E63] border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : files.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Image className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-4">Henüz dosya yüklenmemiş</p>
          <Button 
            className="btn-primary" 
            onClick={() => document.getElementById('upload-input').click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            İlk Dosyayı Yükle
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {files.map((file) => (
            <div 
              key={file.id}
              className="glass rounded-xl overflow-hidden group cursor-pointer hover:border-[#E91E63]/30 transition-all"
              data-testid={`file-${file.id}`}
            >
              {/* Thumbnail */}
              <div 
                className="aspect-square bg-white/5 relative overflow-hidden"
                onClick={() => { setSelectedFile(file); setShowPreviewDialog(true); }}
              >
                {file.type?.includes('image') ? (
                  <img 
                    src={file.url || `${API_URL}/api/files/${file.path}`}
                    alt={file.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <File className="w-12 h-12 text-white/20" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="ghost" className="text-white" onClick={(e) => { e.stopPropagation(); copyUrl(file); }}>
                    {copiedId === file.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white" onClick={(e) => { e.stopPropagation(); window.open(file.url, '_blank'); }}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Info */}
              <div className="p-3">
                <p className="text-white text-sm truncate">{file.filename}</p>
                <p className="text-white/40 text-xs">{formatSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Dosya</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Tip</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Boyut</th>
                  <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Tarih</th>
                  <th className="text-right px-6 py-4 text-white/60 text-sm font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {files.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <tr key={file.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5">
                            {file.type?.includes('image') ? (
                              <img 
                                src={file.url || `${API_URL}/api/files/${file.path}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileIcon className="w-5 h-5 text-white/40" />
                              </div>
                            )}
                          </div>
                          <span className="text-white">{file.filename}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">{file.type || 'Bilinmiyor'}</td>
                      <td className="px-6 py-4 text-white/60 text-sm">{formatSize(file.size)}</td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {new Date(file.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-white/60">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#15151F] border-white/10">
                            <DropdownMenuItem 
                              className="text-white/70 hover:text-white"
                              onClick={() => { setSelectedFile(file); setShowPreviewDialog(true); }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Önizle
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-white/70 hover:text-white"
                              onClick={() => copyUrl(file)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              URL Kopyala
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-white/70 hover:text-white"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              İndir
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-400"
                              onClick={() => deleteFile(file.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="bg-[#15151F] border-white/10 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedFile?.filename}</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="mt-4">
              {selectedFile.type?.includes('image') ? (
                <img 
                  src={selectedFile.url || `${API_URL}/api/files/${selectedFile.path}`}
                  alt={selectedFile.filename}
                  className="w-full max-h-[60vh] object-contain rounded-lg"
                />
              ) : (
                <div className="text-center py-12">
                  <File className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">Bu dosya türü önizlenemez</p>
                </div>
              )}
              
              <div className="mt-4 p-4 bg-white/5 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Boyut:</span>
                  <span className="text-white">{formatSize(selectedFile.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Tip:</span>
                  <span className="text-white">{selectedFile.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Yüklenme:</span>
                  <span className="text-white">{new Date(selectedFile.created_at).toLocaleString('tr-TR')}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1 btn-outline"
                  onClick={() => copyUrl(selectedFile)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  URL Kopyala
                </Button>
                <Button 
                  className="flex-1 btn-primary"
                  onClick={() => window.open(selectedFile.url, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  İndir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMedia;
