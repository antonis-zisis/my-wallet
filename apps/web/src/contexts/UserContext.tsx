import { useMutation, useQuery } from '@apollo/client/react';
import { createContext, type ReactNode, useContext } from 'react';

import { GET_ME, UPDATE_ME } from '../graphql/user';
import { useAuth } from './AuthContext';

interface User {
  id: string;
  email: string;
  fullName: string | null;
}

interface UpdateUserInput {
  fullName?: string;
}

interface MeData {
  me: User;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUser: (input: UpdateUserInput) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();

  const { data, loading } = useQuery<MeData>(GET_ME, {
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
      value={{ user: data?.me ?? null, loading, updateUser }}
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
