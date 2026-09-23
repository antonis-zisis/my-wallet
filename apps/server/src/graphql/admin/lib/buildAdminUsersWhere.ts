type BuildAdminUsersWhereInput = {
  search?: string;
};

export function buildAdminUsersWhere({ search }: BuildAdminUsersWhereInput) {
  const trimmedSearch = search?.trim();

  if (!trimmedSearch) {
    return {};
  }

  return {
    OR: [
      { email: { contains: trimmedSearch, mode: 'insensitive' as const } },
      { fullName: { contains: trimmedSearch, mode: 'insensitive' as const } },
    ],
  };
}
