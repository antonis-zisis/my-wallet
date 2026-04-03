export const baseResolvers = {
  Query: {
    health: () => {
      return 'GraphQL server is running!';
    },
  },
};
