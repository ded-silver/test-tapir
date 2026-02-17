import type { ProductsResponse } from "~/types/api";

export const DEFAULT_LIMIT = 16;

export function useProductsApi() {
  const config = useRuntimeConfig();

  async function fetchProducts(
    page: number,
    limit: number = DEFAULT_LIMIT,
  ): Promise<ProductsResponse> {
    const apiBase = config.public.apiBase as string;
    const data = await $fetch<ProductsResponse>(`${apiBase}/products`, {
      query: { page, limit },
    });
    return data;
  }

  return { fetchProducts };
}
