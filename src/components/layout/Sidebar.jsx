import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, MapPin, Plus, Search } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useLocations } from '@/hooks/useLocations';

function FilterControls() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [regionId, setRegionId] = useState(searchParams.get('regionId') || '');
  const [comuna, setComuna] = useState(searchParams.get('comuna') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [radius, setRadius] = useState(Number(searchParams.get('radius')) || 200);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const { regions, cities, loadingRegions, loadingCities } = useLocations(regionId);

  // Cargar filtros guardados en localStorage al montar si los parámetros en URL están vacíos
  useEffect(() => {
    if (searchParams.toString() === '') {
      try {
        const saved = localStorage.getItem('vitrina_filters');
        if (saved) {
          const parsed = JSON.parse(saved);
          const params = new URLSearchParams();
          Object.entries(parsed).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params.set(key, value.toString());
            }
          });
          if (params.toString() !== '') {
            setSearchParams(params);
          }
        }
      } catch (err) {
        console.error('Error cargando filtros de localStorage:', err);
      }
    }
  }, []);

  // Sincronizar estados locales cuando cambia la URL
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setRegionId(searchParams.get('regionId') || '');
    setComuna(searchParams.get('comuna') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setCondition(searchParams.get('condition') || '');
    setRadius(Number(searchParams.get('radius')) || 200);
    setSort(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  // Guardar filtros activos en localStorage al actualizar searchParams
  useEffect(() => {
    const activeFilters = {
      search: searchParams.get('search') || '',
      regionId: searchParams.get('regionId') || '',
      comuna: searchParams.get('comuna') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      condition: searchParams.get('condition') || '',
      radius: searchParams.get('radius') || '',
      sort: searchParams.get('sort') || 'newest'
    };
    localStorage.setItem('vitrina_filters', JSON.stringify(activeFilters));
  }, [searchParams]);

  const applyFilters = (updatedFilters) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    applyFilters({ search });
  };

  const handleCreatePostClick = () => {
    navigate(user ? '/publicar' : '/login?redirect=/publicar');
  };

  return (
    <div className="flex min-h-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-100">Filtros de búsqueda</h2>
        <span className="text-xs text-slate-500">Filtrar resultados</span>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400">Búsqueda</label>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 size-4 text-slate-500 pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              applyFilters({ search: event.target.value });
            }}
            placeholder="¿Qué estás buscando?"
            className="w-full rounded-xl border-slate-700/80 bg-slate-900/70 pl-10 text-slate-100 placeholder-slate-500 focus-visible:border-indigo-400 focus-visible:ring-0"
          />
        </div>
      </form>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400">Ordenar por</label>
        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value);
            applyFilters({ sort: value });
          }}
        >
          <SelectTrigger className="w-full rounded-xl border-slate-700/80 bg-slate-900/70 text-slate-100 focus:border-indigo-400">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent className="border-slate-700 bg-slate-900 text-slate-100">
            <SelectItem value="newest">Más recientes</SelectItem>
            <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400">Región</label>
          <Select
            value={regionId || 'all'}
            onValueChange={(value) => {
              const selectedRegionId = value === 'all' ? '' : value;
              setRegionId(selectedRegionId);
              setComuna('');
              applyFilters({ regionId: selectedRegionId, comuna: '' });
            }}
            disabled={loadingRegions}
          >
            <SelectTrigger className="w-full rounded-xl border-slate-700/80 bg-slate-900/70 text-slate-100 focus:border-indigo-400">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-slate-500" />
                <SelectValue placeholder="Todo Chile" />
              </div>
            </SelectTrigger>
            <SelectContent className="border-slate-700 bg-slate-900 text-slate-100">
              <SelectItem value="all">Todo Chile</SelectItem>
              {regions.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>{item.shortName || item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {regionId && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400">Comuna</label>
            <Select
              value={comuna || 'all'}
              onValueChange={(value) => {
                const selectedComuna = value === 'all' ? '' : value;
                setComuna(selectedComuna);
                applyFilters({ comuna: selectedComuna });
              }}
              disabled={loadingCities}
            >
              <SelectTrigger className="w-full rounded-xl border-slate-700/80 bg-slate-900/70 text-slate-100 focus:border-indigo-400">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-slate-500" />
                  <SelectValue placeholder="Todas las comunas" />
                </div>
              </SelectTrigger>
              <SelectContent className="border-slate-700 bg-slate-900 text-slate-100">
                <SelectItem value="all">Todas las comunas</SelectItem>
                {cities.map((item) => (
                  <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="mt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Radio de búsqueda</span>
            <span className="font-medium text-indigo-400">{radius} km</span>
          </div>
          <Slider
            min={10}
            max={500}
            step={10}
            value={[radius]}
            onValueChange={(value) => setRadius(value[0])}
            onValueCommit={(value) => applyFilters({ radius: value[0] })}
            className="w-full cursor-pointer py-2 [&_[data-slot=slider-range]]:bg-indigo-400 [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-indigo-200 [&_[data-slot=slider-thumb]]:bg-indigo-500 [&_[data-slot=slider-thumb]]:shadow-[0_0_0_4px_rgba(129,140,248,0.18)] [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-slate-700"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400">Rango de precio</label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={minPrice}
            onChange={(event) => {
              setMinPrice(event.target.value);
              applyFilters({ minPrice: event.target.value });
            }}
            placeholder="Mínimo"
            className="rounded-xl border-slate-700/80 bg-slate-900/70 text-slate-100 placeholder-slate-500 focus-visible:border-indigo-400 focus-visible:ring-0"
          />
          <Input
            type="number"
            value={maxPrice}
            onChange={(event) => {
              setMaxPrice(event.target.value);
              applyFilters({ maxPrice: event.target.value });
            }}
            placeholder="Máximo"
            className="rounded-xl border-slate-700/80 bg-slate-900/70 text-slate-100 placeholder-slate-500 focus-visible:border-indigo-400 focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400">Estado</label>
        <ToggleGroup
          type="single"
          value={condition}
          onValueChange={(value) => {
            setCondition(value || '');
            applyFilters({ condition: value || '' });
          }}
          className="grid w-full grid-cols-2 gap-2"
        >
          <ToggleGroupItem value="Nuevo" className="h-11 rounded-xl border border-slate-700/80 bg-slate-900/70 text-slate-300 data-[state=on]:border-indigo-400/60 data-[state=on]:bg-indigo-500/15 data-[state=on]:text-indigo-200">
            Nuevo
          </ToggleGroupItem>
          <ToggleGroupItem value="Usado" className="h-11 rounded-xl border border-slate-700/80 bg-slate-900/70 text-slate-300 data-[state=on]:border-indigo-400/60 data-[state=on]:bg-indigo-500/15 data-[state=on]:text-indigo-200">
            Usado
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Separator className="my-1 h-px bg-slate-700/90" />

      <Button onClick={handleCreatePostClick} className="w-full rounded-xl bg-indigo-200 py-5 font-bold text-indigo-950 hover:bg-indigo-300" size="lg">
        <Plus data-icon="inline-start" />
        Crear publicación
      </Button>

      <div className="mt-auto flex flex-col gap-2.5 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Información legal</span>
        <Link to="#" className="text-[11px] text-slate-400 transition-colors hover:text-indigo-400">Términos de servicio</Link>
        <Link to="#" className="text-[11px] text-slate-400 transition-colors hover:text-indigo-400">Privacidad</Link>
        <Link to="#" className="text-[11px] text-slate-400 transition-colors hover:text-indigo-400">Soporte</Link>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <>
      <div className="w-full border-b border-slate-800 bg-slate-900 p-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-center rounded-xl border-slate-800 bg-slate-950 text-slate-200">
              <Filter data-icon="inline-start" />
              Abrir filtros
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="border-slate-800 bg-slate-900 p-0 text-slate-200">
            <SheetHeader className="sr-only">
              <SheetTitle>Filtros de búsqueda</SheetTitle>
              <SheetDescription>Panel de filtros para la galería de publicaciones.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-full">
              <div className="flex min-h-dvh p-6">
                <FilterControls />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden w-80 flex-shrink-0 select-none border-r border-slate-800 bg-slate-900 p-6 lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:flex-col lg:overflow-y-auto">
        <FilterControls />
      </aside>
    </>
  );
}
