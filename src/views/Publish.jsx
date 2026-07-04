import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Loader2, Save, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { sileo } from 'sileo';
import { useUser } from '@/context/UserContext';
import { createDraft, createPost, getPostById, updatePost, updateDraft } from '@/api/posts';
import { getCitiesByRegion, getRegions } from '@/api/locations';
import { postSchema } from '@/schemas/post.schema';
import { FREE_ACCOUNT_LIMITS } from '@/config/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

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
  const postId = searchParams.get('postId');
  const isEditingPost = Boolean(postId);
  const isEditingDraft = Boolean(draftId);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [regionId, setRegionId] = useState('');
  const [cityId, setCityId] = useState('');
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPost, setLoadingPost] = useState(Boolean(draftId || postId));
  const [initializingForm, setInitializingForm] = useState(true);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [registeringDraft, setRegisteringDraft] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const isLoadingInitialData = initializingForm || loadingRegions || loadingPost || loadingCities;
  const isBusy = submitting || savingDraft || registeringDraft || isLoadingInitialData;
  const regionSelectValue = regions.some((item) => item.id.toString() === regionId) ? regionId : 'none';
  const citySelectValue = cities.some((item) => item.id.toString() === cityId) ? cityId : 'none';

  useEffect(() => {
    let cancelled = false;
    const postToLoadId = draftId || postId;

    Promise.resolve().then(async () => {
      setInitializingForm(true);
      setLoadingRegions(true);
      setLoadingPost(Boolean(postToLoadId));
      setLoadingCities(Boolean(postToLoadId));

      const [dbRegions, loadedPost] = await Promise.all([
        getRegions(),
        postToLoadId ? getPostById(postToLoadId) : Promise.resolve(null)
      ]);

      const loadedRegionId = loadedPost?.regionId || '';
      const loadedCities = loadedRegionId ? await getCitiesByRegion(loadedRegionId) : [];

      if (!cancelled) {
        setRegions(dbRegions);
        setCities(loadedCities);

        if (loadedPost) {
          setTitle(loadedPost.title === 'Sin Título' ? '' : loadedPost.title || '');
          setPrice(loadedPost.price ? loadedPost.price.toString() : '');
          setDescription(loadedPost.description || '');
          setRegionId(loadedRegionId);
          setCityId(loadedPost.cityId || '');
          setImages(loadedPost.images || []);
        }
      }
    }).catch((error) => {
      if (cancelled) return;
      console.error('Error cargando datos de publicación:', error);

      if (postId) {
        sileo.error({
          title: 'No se pudo cargar la publicación',
          description: error.message || 'La publicación no está disponible.'
        });
        navigate('/perfil');
        return;
      }

      sileo.error({
        title: postToLoadId ? 'No se pudo cargar el borrador' : 'No se pudieron cargar las regiones',
        description: error.message || 'Intenta nuevamente en unos segundos.'
      });
    }).finally(() => {
      if (!cancelled) {
        setLoadingRegions(false);
        setLoadingPost(false);
        setLoadingCities(false);
        setInitializingForm(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [draftId, navigate, postId]);

  useEffect(() => {
    if (draftId || postId || !user) return;

    let cancelled = false;

    Promise.resolve().then(async () => {
      if (cancelled) return;

      setRegisteringDraft(true);
      const draft = await createDraft(user);

      if (!cancelled) {
        sileo.success({
          title: 'Borrador creado',
          description: 'Ya puedes completar los datos y agregar imágenes a esta publicación.'
        });
        navigate(`/publicar?draftId=${draft.id}`, { replace: true });
      }
    }).catch((error) => {
      if (cancelled) return;

      sileo.error({
        title: 'No se pudo preparar el borrador',
        description: error.message || 'Intenta nuevamente en unos segundos.'
      });
      navigate('/perfil?tab=drafts', { replace: true });
    }).finally(() => {
      if (!cancelled) {
        setRegisteringDraft(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [draftId, navigate, postId, user]);

  const handleRegionChange = (value) => {
    const nextRegionId = value === 'none' ? '' : value;

    setRegionId(nextRegionId);
    setCityId('');
    setCities([]);

    if (!nextRegionId) return;

    setLoadingCities(true);
    Promise.resolve().then(async () => {
      const dbCities = await getCitiesByRegion(nextRegionId);
      setCities(dbCities);
    }).catch((error) => {
      console.error('Error cargando comunas:', error);
      sileo.error({
        title: 'No se pudieron cargar las comunas',
        description: error.message || 'Intenta nuevamente en unos segundos.'
      });
    }).finally(() => {
      setLoadingCities(false);
    });
  };

  const handleAddMockImage = (selectedImage) => {
    if (images.length >= FREE_ACCOUNT_LIMITS.MAX_IMAGES_PER_POST) {
      sileo.error({
        title: 'Límite de imágenes',
        description: `Solo se permite subir un máximo de ${FREE_ACCOUNT_LIMITS.MAX_IMAGES_PER_POST} imágenes.`
      });
      return;
    }

    if (images.includes(selectedImage)) return;
    setImages([...images, selectedImage]);
    setIsImageDialogOpen(false);
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);

    const postData = {
      title,
      price: price === '' ? NaN : Number(price),
      description,
      regionId,
      cityId,
      images
    };

    try {
      postSchema.parse(postData);
      if (isEditingPost) {
        await updatePost(postId, postData, user);
      } else {
        await createPost(postData, user);
      }

      navigate(isEditingPost ? '/perfil' : '/');
    } catch (err) {
      if (err.name === 'ZodError') {
        const fieldErrors = {};
        const validationErrors = err.errors || err.issues || [];
        validationErrors.forEach((validationError) => {
          fieldErrors[validationError.path[0]] = validationError.message;
        });
        setErrors(fieldErrors);
        sileo.error({
          title: 'Faltan datos para publicar',
          description: validationErrors[0]?.message || 'Completa los campos obligatorios antes de continuar.'
        });
      } else {
        sileo.error({
          title: 'No se pudo publicar',
          description: err.message || 'Error al publicar'
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    setErrors({});

    if (isEditingPost) {
      sileo.error({
        title: 'Ya es una publicación',
        description: 'Los cambios de una publicación publicada se guardan con Actualizar publicación.'
      });
      return;
    }

    const numericPrice = price === '' ? 0 : Number(price);

    setSavingDraft(true);

    Promise.resolve().then(async () => {
      if (draftId) {
        // Real API draft
        await updateDraft(draftId, {
          title,
          price: Number.isNaN(numericPrice) ? 0 : numericPrice,
          description,
          regionId,
          cityId,
          images,
          condition: 'Usado' // default
        });
      }

      sileo.success({
        title: 'Borrador guardado',
        description: 'Redirigiendo a tu perfil...'
      });
      setTimeout(() => {
        setSavingDraft(false);
        navigate('/perfil?tab=drafts');
      }, 1200);
    }).catch((error) => {
      console.error('Error al guardar borrador:', error);
      setSavingDraft(false);
      sileo.error({
        title: 'Error al guardar borrador',
        description: error.message || 'No se pudo guardar el borrador en el servidor.'
      });
    });
  };

  const handleCancel = () => {
    if (draftId) {
      navigate('/perfil?tab=drafts');
      return;
    }

    navigate(postId ? '/perfil' : '/');
  };

  const pageTitle = isEditingPost
    ? 'Editar publicación'
    : isEditingDraft
    ? 'Continuar borrador'
    : 'Crear publicación';

  return (
    <div className="mx-auto flex w-full max-w-3xl justify-center px-4 py-8 sm:px-6 lg:py-10">
      <Helmet>
        <title>{`${pageTitle} | Vitrina`}</title>
        <meta name="description" content="Publica tu producto o servicio en Vitrina para vender de manera directa y segura." />
      </Helmet>

      <Card className="relative flex w-full flex-col gap-6 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20 sm:p-8">
        {isBusy && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-slate-950/55 text-slate-100 backdrop-blur-sm">
            <Loader2 className="size-6 animate-spin text-indigo-300" />
            <span className="text-sm font-semibold">
              {isLoadingInitialData
                ? 'Cargando información...'
                : registeringDraft
                ? 'Preparando borrador...'
                : savingDraft
                ? 'Guardando borrador...'
                : 'Guardando publicación...'}
            </span>
          </div>
        )}

        <CardHeader className="border-none bg-transparent p-0">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-100">
            {pageTitle}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Detalla los datos del artículo para publicarlo en la galería.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <form onSubmit={handlePublish} className="flex flex-col gap-5">
            <fieldset disabled={isBusy} className="flex flex-col gap-5 disabled:opacity-75">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Imágenes ({images.length} de {FREE_ACCOUNT_LIMITS.MAX_IMAGES_PER_POST})</label>
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <div key={img} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/70">
                    <img src={img} alt="Miniatura" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, currentIndex) => currentIndex !== index))}
                      className="absolute right-1 top-1 rounded-md bg-slate-950/70 p-1 text-slate-400 transition-colors hover:text-rose-400"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}

                {images.length < FREE_ACCOUNT_LIMITS.MAX_IMAGES_PER_POST && (
                  <Dialog open={isImageDialogOpen} onOpenChange={(open) => !isBusy && setIsImageDialogOpen(open)}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700/80 bg-slate-900/70 text-slate-500 transition-all hover:border-indigo-400/60 hover:bg-slate-900 hover:text-slate-300"
                      >
                        <Camera className="size-5" />
                        <span className="text-[9px] font-semibold uppercase">Cargar</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="border border-slate-700 bg-slate-900 text-slate-200">
                      <DialogHeader>
                        <DialogTitle>Seleccionar imagen mock</DialogTitle>
                        <DialogDescription>Elige una imagen de muestra para simular la carga del artículo.</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {MOCK_IMAGES_BANK.map((img) => (
                          <button
                            key={img}
                            type="button"
                            disabled={images.includes(img)}
                            onClick={() => handleAddMockImage(img)}
                            className="aspect-square overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/70 transition hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <img src={img} alt="Imagen de muestra" className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {errors.images && <span className="pl-1 text-[10px] font-medium text-rose-400">{errors.images}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Título</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej: Bicicleta de montaña Trek, seminueva" className="rounded-xl border-slate-700/80 bg-slate-900/70 text-slate-100 placeholder-slate-500 focus-visible:border-indigo-400 focus-visible:ring-0" />
              {errors.title && <span className="pl-1 text-[10px] font-medium text-rose-400">{errors.title}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Precio (CLP)</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm text-slate-500">$</span>
                <Input type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="450000" className="rounded-xl border-slate-700/80 bg-slate-900/70 pl-8 text-slate-100 placeholder-slate-500 focus-visible:border-indigo-400 focus-visible:ring-0" />
              </div>
              {errors.price && <span className="pl-1 text-[10px] font-medium text-rose-400">{errors.price}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400">Descripción</label>
              <Textarea rows="5" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe el estado de tu artículo, detalles de entrega, etc..." className="min-h-32 rounded-xl border-slate-700/80 bg-slate-900/70 text-slate-100 placeholder-slate-500 focus-visible:border-indigo-400 focus-visible:ring-0" />
              {errors.description && <span className="pl-1 text-[10px] font-medium text-rose-400">{errors.description}</span>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Región</label>
                <Select
                  key={`region-${regions.length}-${regionSelectValue}`}
                  value={regionSelectValue}
                  onValueChange={handleRegionChange}
                  disabled={loadingRegions}
                >
                  <SelectTrigger className="rounded-xl border-slate-700/80 bg-slate-900/70 text-slate-100 focus:border-indigo-400"><SelectValue placeholder="Selecciona región" /></SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900 text-slate-100">
                    <SelectItem value="none">{loadingRegions ? 'Cargando regiones...' : 'Selecciona región'}</SelectItem>
                    {regions.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>{item.shortName || item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.regionId && <span className="pl-1 text-[10px] font-medium text-rose-400">{errors.regionId}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Comuna</label>
                <Select
                  key={`city-${regionId}-${cities.length}-${citySelectValue}`}
                  value={citySelectValue}
                  onValueChange={(value) => setCityId(value === 'none' ? '' : value)}
                  disabled={!regionId || loadingCities}
                >
                  <SelectTrigger className="rounded-xl border-slate-700/80 bg-slate-900/70 text-slate-100 focus:border-indigo-400 disabled:opacity-60"><SelectValue placeholder="Selecciona comuna" /></SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900 text-slate-100">
                    <SelectItem value="none">{loadingCities ? 'Cargando comunas...' : 'Selecciona comuna'}</SelectItem>
                    {cities.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cityId && <span className="pl-1 text-[10px] font-medium text-rose-400">{errors.cityId}</span>}
              </div>
            </div>

            <Separator className="bg-slate-700/70" />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" onClick={handleCancel} disabled={isBusy} variant="ghost" className="rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-100">
                Cancelar
              </Button>
              {!isEditingPost && (
                <Button type="button" onClick={handleSaveDraft} disabled={isBusy} variant="outline" className="rounded-xl border-slate-700/80 bg-slate-900/70 text-slate-300 hover:bg-slate-800/80">
                  <Save data-icon="inline-start" />
                  Guardar borrador
                </Button>
              )}
              <Button type="submit" disabled={isBusy} className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-500">
                {submitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
                {submitting ? 'Guardando...' : isEditingPost ? 'Actualizar publicación' : 'Publicar ahora'}
              </Button>
            </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
