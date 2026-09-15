import type { FragmentDefinitionNode, GraphQLResolveInfo } from 'graphql';
import { parse } from 'graphql';
import { describe, expect, it } from 'vitest';

import { selectsItemField } from './selectsItemField';

function makeInfo(query: string): GraphQLResolveInfo {
  const document = parse(query);
  const operation = document.definitions.find(
    (definition) => definition.kind === 'OperationDefinition'
  )!;
  const fragments = Object.fromEntries(
    document.definitions
      .filter(
        (definition): definition is FragmentDefinitionNode =>
          definition.kind === 'FragmentDefinition'
      )
      .map((fragment) => [fragment.name.value, fragment])
  );

  return {
    fieldNodes: operation.selectionSet.selections,
    fragments,
  } as unknown as GraphQLResolveInfo;
}

describe('selectsItemField', () => {
  it('finds a field selected on items', () => {
    const info = makeInfo('{ reports { items { id transactions { type } } } }');

    expect(selectsItemField(info, 'transactions')).toBe(true);
  });

  it('does not find a field the query left out', () => {
    const info = makeInfo('{ reports { items { id title } totalCount } }');

    expect(selectsItemField(info, 'transactions')).toBe(false);
  });

  it('does not confuse a field selected outside items', () => {
    const info = makeInfo('{ reports { totalCount items { id } } }');

    expect(selectsItemField(info, 'totalCount')).toBe(false);
  });

  describe('when the selection uses fragments', () => {
    it('finds a field inside a named fragment', () => {
      const info = makeInfo(`
        { reports { items { ...ReportFields } } }
        fragment ReportFields on Report { id transactions { type } }
      `);

      expect(selectsItemField(info, 'transactions')).toBe(true);
    });

    it('finds a field inside an inline fragment', () => {
      const info = makeInfo(
        '{ reports { items { ... on Report { transactions { type } } } } }'
      );

      expect(selectsItemField(info, 'transactions')).toBe(true);
    });
  });
});
