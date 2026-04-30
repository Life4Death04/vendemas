'use client';

import { useState, useMemo } from 'react';
import { useStore }        from '@/context/StoreContext';
import { useToast }        from '@/context/ToastContext';
import { PageHeader }      from '@/components/ui/PageHeader';
import { BcvBadge }        from '@/components/ui/BcvBadge';
import { BottomSheet }     from '@/components/ui/BottomSheet';
import { ConfirmDialog }   from '@/components/ui/ConfirmDialog';
import { ProductCard }     from '@/components/products/ProductCard';
import { ProductForm }     from '@/components/products/ProductForm';
import type { Product, SortOrder } from '@/lib/types';

const SORT_LABELS: Record<SortOrder, string> = {
  az:           'A → Z',
  za:           'Z → A',
  'price-asc':  'Precio ↑',
  'price-desc': 'Precio ↓',
};

export default function ProductosPage() {
  const { products, bcv, settings, addProduct, updateProduct, deleteProduct } = useStore();
  const { showToast } = useToast();

  const [search,        setSearch]        = useState('');
  const [sortOrder,     setSortOrder]     = useState<SortOrder>('az');
  const [formOpen,      setFormOpen]      = useState(false);
  const [sortOpen,      setSortOpen]      = useState(false);
  const [editProduct,   setEditProduct]   = useState<Product | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    switch (sortOrder) {
      case 'az':         list.sort((a, b) => a.name.localeCompare(b.name));   break;
      case 'za':         list.sort((a, b) => b.name.localeCompare(a.name));   break;
      case 'price-asc':  list.sort((a, b) => a.priceUsd - b.priceUsd);        break;
      case 'price-desc': list.sort((a, b) => b.priceUsd - a.priceUsd);        break;
    }
    return list;
  }, [products, search, sortOrder]);

  function handleSave(data: Omit<Product, 'id' | 'createdAt'>) {
    if (editProduct) {
      updateProduct(editProduct.id, data);
      showToast('Producto actualizado', 'success');
    } else {
      addProduct(data);
      showToast('Producto agregado', 'success');
    }
    setFormOpen(false);
    setEditProduct(null);
  }

  function handleEdit(p: Product) {
    setEditProduct(p);
    setFormOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    showToast('Producto eliminado');
    setDeleteTarget(null);
  }

  return (
    <>
      <PageHeader
        title="Mis Productos"
        right={<BcvBadge />}
      />

      <div className="px-4 pt-4">
        {/* Search + sort */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full h-[46px] pl-10 pr-3.5 rounded-xl border-[1.5px] border-border bg-bg text-base outline-none focus:border-primary focus:bg-surface focus:shadow-[0_0_0_3px_rgba(26,86,219,.12)] transition-all"
            />
          </div>
          <button
            onClick={() => setSortOpen(true)}
            className="w-[52px] h-[46px] flex items-center justify-center border-[1.5px] border-border rounded-xl bg-surface flex-shrink-0 active:bg-bg transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="8" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Sort indicator */}
        <p className="text-xs text-muted mb-3">
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''} · Ordenado: {SORT_LABELS[sortOrder]}
        </p>

        {/* Product list */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-14 pb-6 text-center gap-3">
            <span className="text-[56px]">🛒</span>
            <p className="text-lg font-bold text-text">Sin productos todavía</p>
            <p className="text-[15px] text-muted max-w-[260px]">Agrega tu primer producto para comenzar</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-14 pb-6 text-center gap-3">
            <span className="text-[56px]">🔍</span>
            <p className="text-lg font-bold text-text">No se encontró &quot;{search}&quot;</p>
            <p className="text-[15px] text-muted max-w-[260px]">Intenta con otro nombre o revisa la ortografía</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                bcvRate={bcv.rate}
                generalProfit={settings.generalProfit}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

        {/* Add button */}
        <button
          onClick={() => { setEditProduct(null); setFormOpen(true); }}
          className="w-full h-[52px] bg-primary text-white rounded-xl text-base font-semibold mt-5 flex items-center justify-center gap-2"
        >
          + Agregar producto
        </button>
      </div>

      {/* Product form sheet */}
      <BottomSheet
        open={formOpen}
        title={editProduct ? 'Editar producto' : 'Agregar producto'}
        onClose={() => { setFormOpen(false); setEditProduct(null); }}
      >
        <ProductForm
          product={editProduct}
          bcvRate={bcv.rate}
          generalProfit={settings.generalProfit}
          onSave={handleSave}
          onCancel={() => { setFormOpen(false); setEditProduct(null); }}
        />
      </BottomSheet>

      {/* Sort sheet */}
      <BottomSheet open={sortOpen} title="Ordenar productos" onClose={() => setSortOpen(false)}>
        <div className="flex flex-col gap-2">
          {(Object.entries(SORT_LABELS) as [SortOrder, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => { setSortOrder(val); setSortOpen(false); }}
              className={`h-[52px] rounded-xl text-base font-semibold transition-colors ${sortOrder === val ? 'bg-primary text-white' : 'bg-bg text-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        icon="🗑️"
        title={`¿Eliminar ${deleteTarget?.name}?`}
        body="Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
