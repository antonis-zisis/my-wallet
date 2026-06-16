export const healthResolvers = {
  Query: {
    health: () => {
      return 'GraphQL server is running!';
    },
  },
};
