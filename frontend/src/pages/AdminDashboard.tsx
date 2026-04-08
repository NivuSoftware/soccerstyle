import { useDeferredValue, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ImagePlus,
  LoaderCircle,
  LogOut,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Shield,
  Trash2,
} from "lucide-react";

import BannerFormDialog from "@/components/admin/BannerFormDialog";
import { useAuth } from "@/context/AuthContext";
import { CATEGORIES } from "@/data/products";
import { useAdminBanners } from "@/hooks/useAdminBanners";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-routes";
import type { AdminProduct, ProductMutationPayload } from "@/types/product";
import type { Banner, BannerMutationPayload } from "@/types/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductFormDialog from "@/components/admin/ProductFormDialog";

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "medium",
  timeStyle: "short",
});
const ITEMS_PER_PAGE = 7;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { accessToken, user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [bannerDialogMode, setBannerDialogMode] = useState<"create" | "edit">("create");
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isBannerSubmitting, setIsBannerSubmitting] = useState(false);
  const [deletingBannerId, setDeletingBannerId] = useState<number | null>(null);
  const [productPage, setProductPage] = useState(1);
  const [bannerPage, setBannerPage] = useState(1);

  const handleSessionExpired = () => {
    logout();
    navigate(ADMIN_LOGIN_PATH, { replace: true });
  };

  const {
    products,
    isLoading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
  } = useAdminProducts({
    token: accessToken,
    onUnauthorized: handleSessionExpired,
  });
  const {
    banners,
    isLoading: areBannersLoading,
    error: bannerError,
    loadBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    clearError: clearBannerError,
  } = useAdminBanners({
    token: accessToken,
    onUnauthorized: handleSessionExpired,
  });

  const deferredSearch = useDeferredValue(search);

  const filteredProducts = products.filter((product) => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return true;
    }

    return (
      product.nombre.toLowerCase().includes(normalizedSearch) ||
      product.categoria.toLowerCase().includes(normalizedSearch) ||
      product.tallas_disponibles.join(" ").toLowerCase().includes(normalizedSearch)
    );
  });
  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safeProductPage = Math.min(productPage, totalProductPages);
  const paginatedProducts = filteredProducts.slice(
    (safeProductPage - 1) * ITEMS_PER_PAGE,
    safeProductPage * ITEMS_PER_PAGE,
  );
  const totalBannerPages = Math.max(1, Math.ceil(banners.length / ITEMS_PER_PAGE));
  const safeBannerPage = Math.min(bannerPage, totalBannerPages);
  const paginatedBanners = banners.slice(
    (safeBannerPage - 1) * ITEMS_PER_PAGE,
    safeBannerPage * ITEMS_PER_PAGE,
  );

  const openCreateDialog = () => {
    clearError();
    setProductPage(1);
    setDialogMode("create");
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: AdminProduct) => {
    clearError();
    setDialogMode("edit");
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const closeDialog = (nextOpen: boolean) => {
    if (isSubmitting) {
      return;
    }

    setIsDialogOpen(nextOpen);
    if (!nextOpen) {
      setSelectedProduct(null);
      clearError();
    }
  };

  const handleSubmit = async (payload: ProductMutationPayload) => {
    setIsSubmitting(true);

    try {
      if (dialogMode === "create") {
        await createProduct(payload);
      } else if (selectedProduct) {
        await updateProduct(selectedProduct.id, payload);
      }

      setIsDialogOpen(false);
      setSelectedProduct(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: AdminProduct) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${product.nombre}" del catálogo?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingProductId(product.id);

    try {
      await deleteProduct(product.id);
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ADMIN_LOGIN_PATH, { replace: true });
  };

  const openCreateBannerDialog = () => {
    clearBannerError();
    setBannerPage(1);
    setBannerDialogMode("create");
    setSelectedBanner(null);
    setIsBannerDialogOpen(true);
  };

  const openEditBannerDialog = (banner: Banner) => {
    clearBannerError();
    setBannerDialogMode("edit");
    setSelectedBanner(banner);
    setIsBannerDialogOpen(true);
  };

  const closeBannerDialog = (nextOpen: boolean) => {
    if (isBannerSubmitting) {
      return;
    }

    setIsBannerDialogOpen(nextOpen);
    if (!nextOpen) {
      setSelectedBanner(null);
      clearBannerError();
    }
  };

  const handleBannerSubmit = async (payload: BannerMutationPayload) => {
    setIsBannerSubmitting(true);

    try {
      if (bannerDialogMode === "create") {
        await createBanner(payload);
      } else if (selectedBanner) {
        await updateBanner(selectedBanner.id, payload);
      }

      setIsBannerDialogOpen(false);
      setSelectedBanner(null);
    } finally {
      setIsBannerSubmitting(false);
    }
  };

  const handleDeleteBanner = async (banner: Banner) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el banner #${banner.id}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingBannerId(banner.id);

    try {
      await deleteBanner(banner.id);
    } finally {
      setDeletingBannerId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_28%),linear-gradient(180deg,_#06110c_0%,_#050806_100%)] pb-12 text-foreground">
      <div className="border-b border-primary/10 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-4">
                <img
                  src="/images/logo.png"
                  alt="Soccer Style"
                  className="h-14 w-14 object-contain"
                />
                <div>
                  <p className="font-display text-2xl font-black tracking-tight">
                    SOCCER <span className="text-primary">STYLE</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    Panel administrativo
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{user?.nombre}</span>
                {" · "}
                {user?.email}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="border-border/70 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 lg:grid-cols-[1.3fr_0.38fr_0.38fr]"
          >
            <div className="rounded-[1.75rem] border border-primary/15 bg-card/70 p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Backoffice</p>
              <h1 className="mt-3 font-display text-4xl font-black">
                Catálogo centralizado para Soccer Style
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                Crea, edita y elimina productos desde un solo lugar. 
              </p>
            </div>

            <div>
              <Card className="border-primary/15 bg-card/75">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    Productos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-display text-4xl font-black text-primary">{products.length}</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-primary/15 bg-card/75">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    Banners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-display text-4xl font-black text-primary">{banners.length}</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-primary/15 bg-card/75 p-5 shadow-[0_0_50px_rgba(34,197,94,0.08)] backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
              <Search className="h-4 w-4 text-primary" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o talla"
                className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadProducts()}
                className="border-border/70 bg-transparent"
              >
                <RefreshCcw className="h-4 w-4" />
                Recargar
              </Button>
              <Button
                type="button"
                onClick={openCreateDialog}
                className="gradient-neon text-primary-foreground shadow-[0_0_24px_rgba(34,197,94,0.25)]"
              >
                <Plus className="h-4 w-4" />
                Nuevo producto
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-5 border-destructive/40 bg-destructive/10">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="overflow-hidden rounded-2xl border border-border/70">
            <Table>
              <TableHeader className="bg-background/85">
                <TableRow className="hover:bg-background/85">
                  <TableHead className="w-[92px] px-4">Imagen</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Destacado</TableHead>
                  <TableHead>Regalo</TableHead>
                  <TableHead>Tallas</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Actualizado</TableHead>
                  <TableHead className="w-[180px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
                        Cargando productos...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <ImagePlus className="h-7 w-7 text-primary" />
                        {products.length === 0
                          ? "Todavía no hay productos cargados."
                          : "No encontramos coincidencias para esa búsqueda."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product) => (
                    <TableRow key={product.id} className="bg-card/35 hover:bg-card/60">
                      <TableCell className="px-4 py-3">
                        <img
                          src={product.imagen.url}
                          alt={product.nombre}
                          className="h-16 w-16 rounded-xl border border-border/70 object-cover"
                        />
                      </TableCell>
                      <TableCell className="min-w-[240px] py-3">
                        <div className="font-medium text-foreground">{product.nombre}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          ID #{product.id}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="secondary"
                          className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-primary"
                        >
                          {CATEGORIES.find((category) => category.slug === product.categoria)?.label ?? product.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant={product.estado === "ACTIVO" ? "default" : "outline"}
                          className={
                            product.estado === "ACTIVO"
                              ? "rounded-full px-2.5 py-1"
                              : "rounded-full border-border/70 bg-transparent px-2.5 py-1 text-muted-foreground"
                          }
                        >
                          {product.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant={product.destacar ? "default" : "outline"}
                          className={
                            product.destacar
                              ? "rounded-full px-2.5 py-1"
                              : "rounded-full border-border/70 bg-transparent px-2.5 py-1 text-muted-foreground"
                          }
                        >
                          {product.destacar ? "Sí" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant={product.gift ? "default" : "outline"}
                          className={
                            product.gift
                              ? "rounded-full px-2.5 py-1"
                              : "rounded-full border-border/70 bg-transparent px-2.5 py-1 text-muted-foreground"
                          }
                        >
                          {product.gift ? "Sí" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-[190px] py-3">
                        <div className="flex flex-wrap gap-2">
                          {product.tallas_disponibles.map((size) => (
                            <Badge
                              key={`${product.id}-${size}`}
                              variant="secondary"
                              className="rounded-full border border-primary/15 bg-primary/10 px-2.5 py-1 text-primary"
                            >
                              {size}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 font-medium">
                        {currencyFormatter.format(product.precio)}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-muted-foreground">
                        {dateFormatter.format(new Date(product.updated_at))}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                            className="border-border/70 bg-transparent"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => void handleDelete(product)}
                            disabled={deletingProductId === product.id}
                          >
                            {deletingProductId === product.id ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length > ITEMS_PER_PAGE && (
            <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(safeProductPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(safeProductPage * ITEMS_PER_PAGE, filteredProducts.length)} de{" "}
                {filteredProducts.length} productos
              </p>

              <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={safeProductPage === 1}
                      onClick={() => setProductPage((currentPage) => Math.max(1, currentPage - 1))}
                      className="border-border/70 bg-transparent"
                    >
                      Anterior
                    </Button>
                  </PaginationItem>
                  {Array.from({ length: totalProductPages }, (_, index) => index + 1).map((page) => (
                    <PaginationItem key={`product-page-${page}`}>
                      <Button
                        type="button"
                        variant={page === safeProductPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProductPage(page)}
                        className={
                          page === safeProductPage
                            ? ""
                            : "border-border/70 bg-transparent"
                        }
                      >
                        {page}
                      </Button>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={safeProductPage === totalProductPages}
                      onClick={() =>
                        setProductPage((currentPage) =>
                          Math.min(totalProductPages, currentPage + 1),
                        )
                      }
                      className="border-border/70 bg-transparent"
                    >
                      Siguiente
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[1.75rem] border border-primary/15 bg-card/75 p-5 shadow-[0_0_50px_rgba(34,197,94,0.08)] backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary">
                Promocionales
              </p>
              <h2 className="mt-2 font-display text-3xl font-black">
                Banners horizontales
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Carga imágenes promocionales que luego se mostrarán debajo de los destacados en la página principal.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadBanners()}
                className="border-border/70 bg-transparent"
              >
                <RefreshCcw className="h-4 w-4" />
                Recargar
              </Button>
              <Button
                type="button"
                onClick={openCreateBannerDialog}
                className="gradient-neon text-primary-foreground shadow-[0_0_24px_rgba(34,197,94,0.25)]"
              >
                <Plus className="h-4 w-4" />
                Nuevo banner
              </Button>
            </div>
          </div>

          {bannerError && (
            <Alert variant="destructive" className="mb-5 border-destructive/40 bg-destructive/10">
              <AlertDescription>{bannerError}</AlertDescription>
            </Alert>
          )}

          {areBannersLoading ? (
            <div className="flex h-48 items-center justify-center gap-3 text-muted-foreground">
              <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
              Cargando banners...
            </div>
          ) : banners.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <ImagePlus className="h-7 w-7 text-primary" />
              Todavía no hay banners cargados.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {paginatedBanners.map((banner) => (
                <Card key={banner.id} className="overflow-hidden border-border/70 bg-background/45">
                  <CardContent className="p-0">
                    <img
                      src={banner.imagen.url}
                      alt={`Banner promocional ${banner.id}`}
                      className="aspect-[4.5/1] w-full object-cover"
                    />
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-foreground">Banner #{banner.id}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Actualizado {dateFormatter.format(new Date(banner.updated_at))}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditBannerDialog(banner)}
                          className="border-border/70 bg-transparent"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => void handleDeleteBanner(banner)}
                          disabled={deletingBannerId === banner.id}
                        >
                          {deletingBannerId === banner.id ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {banners.length > ITEMS_PER_PAGE && (
            <div className="mt-5 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {(safeBannerPage - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(safeBannerPage * ITEMS_PER_PAGE, banners.length)} de{" "}
                {banners.length} banners
              </p>

              <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={safeBannerPage === 1}
                      onClick={() => setBannerPage((currentPage) => Math.max(1, currentPage - 1))}
                      className="border-border/70 bg-transparent"
                    >
                      Anterior
                    </Button>
                  </PaginationItem>
                  {Array.from({ length: totalBannerPages }, (_, index) => index + 1).map((page) => (
                    <PaginationItem key={`banner-page-${page}`}>
                      <Button
                        type="button"
                        variant={page === safeBannerPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBannerPage(page)}
                        className={
                          page === safeBannerPage
                            ? ""
                            : "border-border/70 bg-transparent"
                        }
                      >
                        {page}
                      </Button>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={safeBannerPage === totalBannerPages}
                      onClick={() =>
                        setBannerPage((currentPage) =>
                          Math.min(totalBannerPages, currentPage + 1),
                        )
                      }
                      className="border-border/70 bg-transparent"
                    >
                      Siguiente
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>

      <ProductFormDialog
        open={isDialogOpen}
        mode={dialogMode}
        product={selectedProduct}
        isSubmitting={isSubmitting}
        error={error}
        onOpenChange={closeDialog}
        onSubmit={handleSubmit}
      />
      <BannerFormDialog
        open={isBannerDialogOpen}
        mode={bannerDialogMode}
        banner={selectedBanner}
        isSubmitting={isBannerSubmitting}
        error={bannerError}
        onOpenChange={closeBannerDialog}
        onSubmit={handleBannerSubmit}
      />
    </main>
  );
};

export default AdminDashboard;
