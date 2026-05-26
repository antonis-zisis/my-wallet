import {
  GraphQLError,
  Kind,
  type SelectionSetNode,
  type ValidationContext,
} from 'graphql';

export function createDepthLimitRule(maxDepth: number) {
  return (context: ValidationContext) => {
    function measureDepth(
      selectionSet: SelectionSetNode | undefined,
      depth: number
    ): number {
      if (!selectionSet || depth > maxDepth) {
        return depth;
      }

      return Math.max(
        ...selectionSet.selections.map((selection) => {
          if (selection.kind === Kind.FIELD) {
            return measureDepth(selection.selectionSet, depth + 1);
          }

          if (selection.kind === Kind.INLINE_FRAGMENT) {
            return measureDepth(selection.selectionSet, depth);
          }

          return depth;
        })
      );
    }

    return {
      OperationDefinition(node: { selectionSet: SelectionSetNode }) {
        const depth = measureDepth(node.selectionSet, 0);
        if (depth > maxDepth) {
          context.reportError(
            new GraphQLError(
              `Query depth ${depth} exceeds maximum allowed depth of ${maxDepth}.`
            )
          );
        }
      },
    };
  };
}
