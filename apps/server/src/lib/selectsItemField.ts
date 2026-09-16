import type { FieldNode, GraphQLResolveInfo, SelectionSetNode } from 'graphql';

const ITEMS_FIELD = 'items';

function collectFields(
  selectionSet: SelectionSetNode | undefined,
  info: GraphQLResolveInfo
): Array<FieldNode> {
  if (!selectionSet) {
    return [];
  }

  return selectionSet.selections.flatMap((selection) => {
    if (selection.kind === 'Field') {
      return [selection];
    }

    if (selection.kind === 'InlineFragment') {
      return collectFields(selection.selectionSet, info);
    }

    return collectFields(
      info.fragments[selection.name.value]?.selectionSet,
      info
    );
  });
}

export function selectsItemField(
  info: GraphQLResolveInfo,
  fieldName: string
): boolean {
  return info.fieldNodes.some((fieldNode) =>
    collectFields(fieldNode.selectionSet, info)
      .filter((node) => node.name.value === ITEMS_FIELD)
      .some((itemsNode) =>
        collectFields(itemsNode.selectionSet, info).some(
          (node) => node.name.value === fieldName
        )
      )
  );
}
