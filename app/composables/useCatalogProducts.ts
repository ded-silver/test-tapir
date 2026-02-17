import type { Product } from "~/types/api";
import { DEFAULT_LIMIT } from "~/composables/useProductsApi";

export async function useCatalogProducts(limit: number = DEFAULT_LIMIT) {
  const { fetchProducts } = useProductsApi();
  const { data: initialData, error: initialError } = await useAsyncData(
    "catalog-products",
    () => fetchProducts(1, limit),
  );

  const safeData = initialData.value;
  const products = ref<Product[]>(
    Array.isArray(safeData?.products) ? safeData.products : [],
  );
  const currentPage = ref(safeData?.currentPage ?? 1);
  const totalPages = ref(safeData?.totalPages ?? 0);
  const loadState = ref<"idle" | "loading" | "error">(
    initialError.value ? "error" : "idle",
  );

  const hasNextPage = computed(() => currentPage.value < totalPages.value);

  async function loadNextPage() {
    if (loadState.value === "loading") return;
    const isRetryInitial = products.value.length === 0;
    const nextPage = isRetryInitial ? 1 : currentPage.value + 1;
    loadState.value = "loading";
    try {
      const data = await fetchProducts(nextPage, limit);
      const nextProducts = Array.isArray(data?.products) ? data.products : [];
      if (isRetryInitial) {
        products.value = nextProducts;
      } else {
        const existingIds = new Set(products.value.map((p) => p.id));
        const newProducts = nextProducts.filter((p) => !existingIds.has(p.id));
        products.value = [...products.value, ...newProducts];
      }
      currentPage.value = data?.currentPage ?? nextPage;
      totalPages.value = data?.totalPages ?? totalPages.value;
      loadState.value = "idle";
    } catch {
      loadState.value = "error";
    }
  }

  return {
    products,
    loadState,
    hasNextPage,
    loadMore: loadNextPage,
    retry: loadNextPage,
  };
}
