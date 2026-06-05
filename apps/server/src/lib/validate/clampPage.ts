type ClampedPagination = {
  clampedPage: number;
  clampedPageSize: number;
};

export function clampPage(page: number, pageSize: number): ClampedPagination {
  return {
    clampedPage: Math.max(page, 1),
    clampedPageSize: Math.min(Math.max(pageSize, 1), 100),
  };
}
