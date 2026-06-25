import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Plus } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const REGIONS = [
  'Región Metropolitana',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de O\'Higgins',
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de la Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región de Aysén',
  'Región de Magallanes y de la Antártica Chilena'
];

export function Sidebar() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [region, setRegion] = useState(searchParams.get('region') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [radius, setRadius] = useState(Number(searchParams.get('radius')) || 200);

  useEffect(() => {
    Promise.resolve().then(() => {
      setSearch(searchParams.get('search') || '');
      setRegion(searchParams.get('region') || '');
      setMinPrice(searchParams.get('minPrice') || '');
      setMaxPrice(searchParams.get('maxPrice') || '');
      setCondition(searchParams.get('condition') || '');
      setRadius(Number(searchParams.get('radius')) || 200);
    });
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters({ search });
  };

  const handleRegionChange = (val) => {
    const selectedRegion = val === 'all' ? '' : val;
    setRegion(selectedRegion);
    applyFilters({ region: selectedRegion });
  };

  const handleConditionChange = (val) => {
    const newCondition = condition === val ? '' : val;
    setCondition(newCondition);
    applyFilters({ condition: newCondition });
  };

  const handleRadiusChange = (val) => {
    setRadius(val[0]);
  };

  const handleRadiusCommit = (val) => {
    applyFilters({ radius: val[0] });
  };

  const handleCreatePostClick = () => {
    if (!user) {
      navigate('/login?redirect=/publicar');
    } else {
      navigate('/publicar');
    }
  };

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900 p-6 flex flex-col gap-6 select-none lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">

      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-slate-100 font-sans tracking-tight">Filtros de búsqueda</h2>
        <span className="text-xs text-slate-500">Filtrar resultados</span>
      </div>

      {/* Búsqueda */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400">Búsqueda</label>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              applyFilters({ search: e.target.value });
            }}
            placeholder="¿Qué estás buscando?"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl h-11 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus-visible:border-indigo-500 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
          />
        </div>
      </form>

      {/* Ubicación */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400">Ubicación</label>
        <Select value={region || 'all'} onValueChange={handleRegionChange}>
          <SelectTrigger className="w-full bg-slate-950 border-slate-800 rounded-xl h-11 px-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <SelectValue placeholder="Todo Chile" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-950 border border-slate-800 text-slate-200">
            <SelectItem value="all">Todo Chile</SelectItem>
            {REGIONS.map((reg) => (
              <SelectItem key={reg} value={reg}>
                {reg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Radio de búsqueda Slider */}
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Radio de búsqueda</span>
            <span className="font-medium text-indigo-400">{radius} km</span>
          </div>
          <Slider
            min={10}
            max={500}
            step={10}
            value={[radius]}
            onValueChange={handleRadiusChange}
            onValueCommit={handleRadiusCommit}
            className="w-full cursor-pointer py-2 [&_[data-slot=slider-track]]:bg-slate-800 [&_[data-slot=slider-range]]:bg-indigo-500 [&_[data-slot=slider-thumb]]:bg-indigo-400 [&_[data-slot=slider-thumb]]:border-indigo-500"
          />
        </div>
      </div>

      {/* Rango de precio */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400">Rango de precio</label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              applyFilters({ minPrice: e.target.value });
            }}
            placeholder="Mínimo"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl h-11 px-3.5 text-sm text-slate-200 placeholder-slate-600 focus-visible:border-indigo-500 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
          />
          <Input
            type="number"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              applyFilters({ maxPrice: e.target.value });
            }}
            placeholder="Máximo"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl h-11 px-3.5 text-sm text-slate-200 placeholder-slate-600 focus-visible:border-indigo-500 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
          />
        </div>
      </div>

      {/* Estado (Condition) */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400">Estado</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleConditionChange('Nuevo')}
            className={`flex-1 h-11 rounded-xl text-sm transition-all border ${condition === 'Nuevo'
                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
          >
            Nuevo
          </button>
          <button
            type="button"
            onClick={() => handleConditionChange('Usado')}
            className={`flex-1 h-11 rounded-xl text-sm transition-all border ${condition === 'Usado'
                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
          >
            Usado
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-800/60 mt-2" />

      {/* Crear Publicación Button */}
      <Button
        onClick={handleCreatePostClick}
        className="w-full py-5 rounded-xl font-bold bg-indigo-200 hover:bg-indigo-300 text-indigo-950 flex items-center justify-center gap-2 transition-all border-none"
        size="lg"
      >
        <Plus className="w-5 h-5" />
        Crear publicación
      </Button>

      {/* Información Legal Footer */}
      <div className="mt-auto p-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl flex flex-col gap-2.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Información legal</span>
        <Link to="#" className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors">Términos de servicio</Link>
        <Link to="#" className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors">Privacidad</Link>
        <Link to="#" className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors">Soporte</Link>
      </div>

    </aside>
  );
}
