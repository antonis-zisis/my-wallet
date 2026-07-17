import { getInitials } from './getInitials';

type NamedPerson = {
  email: string;
  fullName?: string | null;
};

type AvatarData = {
  initials: string;
  label: string;
};

export function getAvatarData({ email, fullName }: NamedPerson): AvatarData {
  const label = fullName ?? email;

  return { initials: getInitials(label), label };
}
