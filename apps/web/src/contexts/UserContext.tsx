import { useMutation, useQuery } from '@apollo/client/react';
import { createContext, type ReactNode, useContext } from 'react';

import { GET_ME, UPDATE_ME } from '../graphql/user';
import { type PlanStatus } from '../types/billing';
import { type Currency } from '../types/currency';
import { type Plan, type PlanEntitlements } from '../types/plan';
import { useAuth } from './AuthContext';

export type User = {
  id: string;
  canManageBilling: boolean;
  currency: string;
  email: string;
  entitlements: PlanEntitlements;
  fullName: string | null;
  plan: Plan | null;
  planCancelAtPeriodEnd: boolean;
  planRenewsAt: string | null;
  planStatus: PlanStatus | null;
  supabaseId: string;
};

type UpdateUserInput = {
  currency?: Currency;
  fullName?: string;
};

type MeData = {
  me: User;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  refetchUser: () => void;
  updateUser: (input: UpdateUserInput) => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  const { data, loading, refetch } = useQuery<MeData>(GET_ME, {
    skip: !session,
  });

  const [updateMe] = useMutation(UPDATE_ME);

  const updateUser = async (input: UpdateUserInput) => {
    await updateMe({
      variables: { input },
      refetchQueries: [{ query: GET_ME }],
    });
  };

  return (
    <UserContext.Provider
      value={{
        user: data?.me ?? null,
        loading,
        refetchUser: () => {
          refetch();
        },
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
