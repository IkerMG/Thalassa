import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Heart, ExternalLink, AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { marketApi, type ScraperResult } from '../../api/marketApi';
import { useAddWishlistItem } from '../../hooks/mutations/useAddWishlistItem';
import EmptyState from '../../components/shared/EmptyState';
import fallbackData from '../../data/market-fallback.json';
import { normalizeExternalUrl } from '../../lib/url';

// ── Types ─────────────────────────────────────────────────────────────────────

type FallbackItem = ScraperResult & { _category: string };
type StoreFilter = 'all' | 'Urban Natura' | 'Cetamar';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Todo',        keyword: 'acuario marino',     key: 'all' },
  { label: 'Iluminación', keyword: 'led reef coral',     key: 'lighting' },
  { label: 'Bombas',      keyword: 'bomba circulacion',  key: 'pumps' },
  { label: 'Filtración',  keyword: 'filtro skimmer',     key: 'filtration' },
  { label: 'Alimentación',keyword: 'alimento peces',     key: 'feeding' },
  { label: 'Calefacción', keyword: 'calefactor termostato', key: 'heating' },
  { label: 'Reactivos',   keyword: 'test kit acuario',   key: 'testing' },
  { label: 'Decoración',  keyword: 'roca decoracion',    key: 'decoration' },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]['key'];

const STORE_LABELS: Record<StoreFilter, string> = {
  all: 'Todas',
  'Urban Natura': 'Urban Natura',
  'Cetamar':      'Cetamar',
};

const STORE_COLORS: Record<string, string> = {
  'Urban Natura': 'text-emerald-400 border-emerald-400/25 bg-emerald-400/08',
  'Cetamar':      'text-sky-400     border-sky-400/25     bg-sky-400/08',
};

// ── Debounce hook ─────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── ProductCard ───────────────────────────────────────────────────────────────

interface CardProps {
  product: ScraperResult;
  onAddToWishlist: (product: ScraperResult) => void;
  isAdding: boolean;
  fromCache?: boolean;
}

function ProductCard({ product, onAddToWishlist, isAdding, fromCache }: CardProps) {
  const { t } = useTranslation('market');
  const store = product.storeName ?? '';
  const storeBadge = STORE_COLORS[store] ?? 'text-[#A0A0A0] border-[rgba(255,255,255,0.12)]';
  const productHref = normalizeExternalUrl(product.productUrl);

  return (
    <div className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl flex flex-col overflow-hidden hover:border-[rgba(255,255,255,0.14)] transition-colors group">
      {/* Image area */}
      <div className="h-36 bg-[rgba(255,255,255,0.03)] flex items-center justify-center border-b border-[rgba(255,255,255,0.06)]">
        {product.imgUrl ? (
          <img
            src={product.imgUrl}
            alt={product.name}
            className="h-full w-full object-contain p-3"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <ShoppingBag size={32} className="text-[rgba(255,255,255,0.08)]" />
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-white text-sm font-medium leading-snug line-clamp-2 flex-1">
          {product.name ?? '—'}
        </p>

        <div className="flex items-center justify-between gap-1 flex-wrap">
          <span className="text-white font-mono font-semibold">
            {product.price != null ? `€${product.price.toFixed(2)}` : '—'}
          </span>
          <div className="flex items-center gap-1">
            {fromCache && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border text-[#59D3FF] border-[rgba(89,211,255,0.25)] bg-[rgba(89,211,255,0.05)]">
                {t('cachedBadge')}
              </span>
            )}
            {store && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${storeBadge}`}>
                {store}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {productHref ? (
            <a
              href={productHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[rgba(255,255,255,0.10)] text-[#A0A0A0] text-xs font-medium hover:text-white hover:border-[rgba(255,255,255,0.25)] transition-colors"
            >
              <ExternalLink size={12} />
              {t('viewProduct')}
            </a>
          ) : (
            <span className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[rgba(255,255,255,0.04)] text-[#383838] text-xs font-medium cursor-not-allowed select-none">
              <ExternalLink size={12} />
              {t('viewProduct')}
            </span>
          )}
          <button
            onClick={() => onAddToWishlist(product)}
            disabled={isAdding}
            title="Añadir a wishlist"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[rgba(89,211,255,0.20)] text-[#59D3FF] text-xs font-medium hover:bg-[rgba(89,211,255,0.08)] hover:border-[rgba(89,211,255,0.40)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Heart size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-black border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
          <div className="h-36 bg-[rgba(255,255,255,0.04)]" />
          <div className="p-4 flex flex-col gap-2">
            <div className="h-4 w-full bg-[rgba(255,255,255,0.06)] rounded" />
            <div className="h-3 w-2/3 bg-[rgba(255,255,255,0.04)] rounded" />
            <div className="h-8 w-full bg-[rgba(255,255,255,0.04)] rounded-lg mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MarketPage() {
  const { t } = useTranslation('market');
  const [inputValue, setInputValue]       = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
  const [storeFilter, setStoreFilter]     = useState<StoreFilter>('all');
  const debouncedInput                    = useDebounce(inputValue, 400);

  // The actual keyword sent to the API:
  // - if user is typing freely → use debounced input
  // - if a category tab is active and input is empty → use category keyword
  const activeCategoryDef = CATEGORIES.find((c) => c.key === activeCategory)!;
  const searchKeyword = debouncedInput.trim().length >= 2
    ? debouncedInput.trim()
    : activeCategoryDef.keyword;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['market', 'search', searchKeyword],
    queryFn:  () => marketApi.search(searchKeyword),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { mutate: addToWishlist, isPending: isAdding } = useAddWishlistItem();

  const isScraperDown = !!data?.errorCode;
  const fromCache = data?.fromCache === true;
  const usingFallback = isScraperDown;

  // Build display list
  const liveResults   = data?.results ?? [];
  const typedFallback = fallbackData as FallbackItem[];
  const searchText    = debouncedInput.trim().toLowerCase();

  const baseFallback = (() => {
    let items = activeCategory === 'all'
      ? typedFallback
      : typedFallback.filter((p) => p._category === activeCategory);
    // Apply text search on static fallback data too
    if (searchText.length >= 2) {
      items = items.filter((p) => p.name?.toLowerCase().includes(searchText));
    }
    return items;
  })();

  const displayResults: ScraperResult[] = usingFallback ? baseFallback : liveResults;

  // Client-side store filter
  const filtered = storeFilter === 'all'
    ? displayResults
    : displayResults.filter((p) => p.storeName === storeFilter);

  const handleCategoryClick = (key: CategoryKey) => {
    setActiveCategory(key);
    setInputValue('');
    // "Todo" resets all filters so the user truly sees everything
    if (key === 'all') setStoreFilter('all');
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.trim().length >= 2) {
      setActiveCategory('all');
    }
  };

  const handleAddToWishlist = (product: ScraperResult) => {
    addToWishlist({
      productName:  product.name    ?? 'Producto sin nombre',
      price:        product.price   ?? 0,
      productUrl:   product.productUrl ?? '',
      storeName:    product.storeName  ?? '',
      imgUrl:       product.imgUrl ?? null,
      category:     undefined,
      priority:     'MEDIUM',
      notes:        null,
    });
  };

  const showSkeleton = isLoading || (isFetching && !usingFallback);

  return (
    <div className="min-h-full p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag size={22} className="text-[#59D3FF]" />
          {t('title')}
        </h1>
        <p className="text-sm text-[#A0A0A0] mt-1">{t('description')}</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-[#0D0D0D] border border-[rgba(255,255,255,0.08)] rounded-lg pl-9 pr-9 py-3 text-sm text-white placeholder-[#444] outline-none focus:border-[rgba(89,211,255,0.40)] transition-colors"
        />
        {inputValue && (
          <button
            onClick={() => { setInputValue(''); setActiveCategory('all'); setStoreFilter('all'); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryClick(cat.key)}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer',
              activeCategory === cat.key && !inputValue
                ? 'bg-[#59D3FF] text-[#0A0F1E]'
                : 'border border-[rgba(255,255,255,0.10)] text-[#A0A0A0] hover:border-[rgba(255,255,255,0.20)] hover:text-white',
            ].join(' ')}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Store filter + result count row */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex gap-1.5">
          {(['all', 'Urban Natura', 'Cetamar'] as StoreFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStoreFilter(s)}
              className={[
                'px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                storeFilter === s
                  ? 'bg-[rgba(255,255,255,0.08)] text-white'
                  : 'text-[#555] hover:text-[#A0A0A0]',
              ].join(' ')}
            >
              {STORE_LABELS[s]}
            </button>
          ))}
        </div>

        {!showSkeleton && (
          <span className="text-xs text-[#444] shrink-0">
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
      </div>

      {/* Fallback notice */}
      {usingFallback && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-[rgba(251,191,36,0.06)] border border-[rgba(251,191,36,0.18)]">
          <AlertTriangle size={13} className="text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-400/80">{t('fallbackNotice')}</p>
        </div>
      )}

      {/* Results */}
      {showSkeleton ? (
        <GridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={t('noResults')}
          description={t('noResultsDesc', { query: debouncedInput || activeCategoryDef.label })}
          action={
            <button
              onClick={() => { setInputValue(''); setActiveCategory('all'); setStoreFilter('all'); }}
              className="text-sm text-[#59D3FF] hover:underline cursor-pointer"
            >
              {t('clearFilters')}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product, i) => (
            <ProductCard
              key={`${product.productUrl ?? ''}-${i}`}
              product={product}
              onAddToWishlist={handleAddToWishlist}
              isAdding={isAdding}
              fromCache={fromCache}
            />
          ))}
        </div>
      )}
    </div>
  );
}
