import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Helmet } from 'react-helmet-async';
import { mockCreatePost } from '@/api/posts';
import { postSchema } from '@/schemas/post.schema';
import { AlertCircle, Loader2, Camera, X, Check, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STORAGE_KEYS } from '@/config/constants';

const REGIONS_DATA = {
  'Región de Coquimbo': ['La Serena', 'Coquimbo'],
  'Región Metropolitana': ['Santiago', 'Providencia', 'Las Condes'],
  'Región de Valparaíso': ['Valparaíso', 'Viña del Mar']
};

const MOCK_IMAGES_BANK = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800'
];

export function Publish() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId');

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [images, setImages] = useState([]);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (draftId) {
      const savedDrafts = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRAFTS) || '[]');
      const foundDraft = savedDrafts.find(d => d.id === draftId);
      if (foundDraft) {
        Promise.resolve().then(() => {
          setTitle(foundDraft.title || '');
          setPrice(foundDraft.price ? foundDraft.price.toString() : '');
          setDescription(foundDraft.description || '');
          setRegion(foundDraft.region || '');
          setComuna(foundDraft.comuna || '');
          setImages(foundDraft.images || []);
        });
      }
    }
  }, [draftId]);

  const handleRegionChange = (val) => {
    const selectedRegion = val === 'none' ? '' : val;
    setRegion(selectedRegion);
    setComuna('');
  };

  const handleComunaChange = (val) => {
    const selectedComuna = val === 'none' ? '' : val;
    setComuna(selectedComuna);
  };

  const handleAddMockImage = () => {
    if (images.length >= 5) {
      alert('Solo se permite subir un máximo de 5 imágenes');
      return;
    }

    const availableImages = MOCK_IMAGES_BANK.filter(img => !images.includes(img));
    const newImage = availableImages.length > 0
      ? availableImages[0]
      : MOCK_IMAGES_BANK[Math.floor(Math.random() * MOCK_IMAGES_BANK.length)];

    setImages([...images, newImage]);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);
    setSubmitting(true);

    const numericPrice = price === '' ? NaN : Number(price);
    const postData = { title, price: numericPrice, description, region, comuna, images };

    try {

      postSchema.parse(postData);

      await mockCreatePost(postData, user);

      if (draftId) {
        const savedDrafts = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRAFTS) || '[]');
        const filteredDrafts = savedDrafts.filter(d => d.id !== draftId);
        localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(filteredDrafts));
      }

      navigate('/');
    } catch (err) {
      if (err.name === 'ZodError') {
        const fieldErrors = {};
        err.errors.forEach((validationError) => {
          fieldErrors[validationError.path[0]] = validationError.message;
        });
        setErrors(fieldErrors);
      } else {
        setApiError(err.message || 'Error al publicar');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    setErrors({});
    setApiError(null);

    const savedDrafts = JSON.parse(localStorage.getItem(STORAGE_KEYS.DRAFTS) || '[]');

    if (!draftId && savedDrafts.length >= 5) {
      setApiError('Límite de borradores alcanzado. Has llegado al máximo de 5 borradores activos. Elimina alguno en tu perfil antes de guardar uno nuevo.');
      return;
    }

    const numericPrice = price === '' ? 0 : Number(price);

    const draftData = {
      id: draftId || `draft-${Math.random().toString(36).substring(2, 9)}`,
      title,
      price: isNaN(numericPrice) ? 0 : numericPrice,
      description,
      region,
      comuna,
      images
    };

    let updatedDrafts;
    if (draftId) {

      updatedDrafts = savedDrafts.map(d => d.id === draftId ? draftData : d);
    } else {

      updatedDrafts = [draftData, ...savedDrafts];
    }

    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updatedDrafts));
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
      navigate('/perfil');
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl py-6 px-6">
      <Helmet>
        <title>{draftId ? 'Editar Borrador | Vitrina' : 'Crear Publicación | Vitrina'}</title>
        <meta name="description" content="Publica tu producto o servicio en Vitrina para vender de manera directa y segura." />
      </Helmet>
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col gap-6">

        {}
        <CardHeader className="p-0 border-none bg-transparent">
          <CardTitle className="text-2xl font-bold text-slate-100 font-sans tracking-tight">
            {draftId ? 'Continuar Editando Borrador' : 'Crear Publicación'}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Detalla los datos del artículo para publicarlo en la galería
          </CardDescription>
        </CardHeader>

        {}
        {saveSuccess && (
          <div className="flex gap-2 items-center bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 p-3 rounded-xl text-xs">
            <Check className="w-4 h-4 text-indigo-400" />
            <span>Borrador guardado exitosamente. Redirigiendo a tu perfil...</span>
          </div>
        )}

        {}
        {apiError && (
          <div className="flex gap-2.5 items-start bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span>{apiError}</span>
            </div>
          </div>
        )}

        {}
        <CardContent className="p-0">
          <form onSubmit={handlePublish} className="flex flex-col gap-5">

            {}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Imágenes ({images.length} de 5)
              </label>

              <div className="grid grid-cols-5 gap-3">
                {}
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative group">
                    <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-slate-950/80 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddMockImage}
                    className="aspect-square bg-slate-950 hover:bg-slate-900 border border-dashed border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-center items-center gap-1.5 text-slate-500 hover:text-slate-400 transition-all active:scale-95"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-semibold uppercase">Cargar</span>
                  </button>
                )}
              </div>
              {errors.images && (
                <span className="text-[10px] text-rose-400 font-medium pl-1">
                  {errors.images}
                </span>
              )}
            </div>

            {}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Título</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Bicicleta de montaña Trek, seminueva"
                className={`w-full bg-slate-950 border rounded-xl h-11 px-3.5 text-sm text-slate-200 placeholder-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-500 transition-colors ${
                  errors.title ? 'border-rose-500/50 focus-visible:border-rose-500' : 'border-slate-800 focus-visible:border-indigo-500'
                }`}
              />
              {errors.title && (
                <span className="text-[10px] text-rose-400 font-medium pl-1">
                  {errors.title}
                </span>
              )}
            </div>

            {}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Precio (CLP)</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-500 text-sm">$</span>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="450000"
                  className={`w-full bg-slate-950 border rounded-xl h-11 pl-8 pr-3.5 text-sm text-slate-200 placeholder-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-indigo-500 transition-colors ${
                    errors.price ? 'border-rose-500/50 focus-visible:border-rose-500' : 'border-slate-800 focus-visible:border-indigo-500'
                  }`}
                />
              </div>
              {errors.price && (
                <span className="text-[10px] text-rose-400 font-medium pl-1">
                  {errors.price}
                </span>
              )}
            </div>

            {}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Descripción</label>
              <textarea
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el estado de tu artículo, detalles de entrega, etc..."
                className={`w-full bg-slate-950 border rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none ${
                  errors.description ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                }`}
              />
              {errors.description && (
                <span className="text-[10px] text-rose-400 font-medium pl-1">
                  {errors.description}
                </span>
              )}
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Región</label>
                <Select value={region || 'none'} onValueChange={handleRegionChange}>
                  <SelectTrigger className={`w-full bg-slate-950 border rounded-xl h-11 px-3.5 text-sm text-slate-200 focus:outline-none transition-colors cursor-pointer justify-between ${
                    errors.region ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}>
                    <SelectValue placeholder="Selecciona Región" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                    <SelectItem value="none">Selecciona Región</SelectItem>
                    {Object.keys(REGIONS_DATA).map(reg => (
                      <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.region && (
                  <span className="text-[10px] text-rose-400 font-medium pl-1">
                    {errors.region}
                  </span>
                )}
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Comuna</label>
                <Select
                  value={comuna || 'none'}
                  onValueChange={handleComunaChange}
                  disabled={!region}
                >
                  <SelectTrigger className={`w-full bg-slate-950 border rounded-xl h-11 px-3.5 text-sm text-slate-200 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer justify-between ${
                    errors.comuna ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                  }`}>
                    <SelectValue placeholder="Selecciona Comuna" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-200">
                    <SelectItem value="none">Selecciona Comuna</SelectItem>
                    {region && REGIONS_DATA[region].map(com => (
                      <SelectItem key={com} value={com}>{com}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.comuna && (
                  <span className="text-[10px] text-rose-400 font-medium pl-1">
                    {errors.comuna}
                  </span>
                )}
              </div>
            </div>

            {}
            <div className="flex items-center gap-3 justify-end mt-4 pt-4 border-t border-slate-800/40">
              {}
              <Button
                type="button"
                onClick={handleSaveDraft}
                disabled={submitting}
                variant="outline"
                className="px-5 py-5 rounded-xl font-semibold border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-slate-100 flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                Guardar Borrador
              </Button>

              {}
              <Button
                type="submit"
                disabled={submitting}
                className="px-6 py-5 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] border-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  'Publicar ahora'
                )}
              </Button>
            </div>

          </form>
        </CardContent>

      </Card>
    </div>
  );
}
