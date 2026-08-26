import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { HEALTH_QUERY } from '../../graphql/health';
import { getAvatarData } from '../../utils/getAvatarData';
import { LogOutIcon, SparklesIcon, UserIcon } from '../icons';
import { Avatar, Dropdown } from '../ui';

type NavBarUserMenuProps = {
  onOpenWhatsNew: () => void;
};

export function NavBarUserMenu({ onOpenWhatsNew }: NavBarUserMenuProps) {
  const { signOut } = useAuth();
  const { loading, user } = useUser();
  const { showError } = useToast();
  const navigate = useNavigate();
  const { error: healthError, loading: healthLoading } = useQuery<{
    health: string;
  }>(HEALTH_QUERY);

  useEffect(() => {
    if (healthError) {
      showError('Unable to connect to server.');
    }
  }, [healthError, showError]);

  const healthDotClass = healthLoading
    ? 'bg-gray-400 dark:bg-gray-500'
    : healthError
      ? 'bg-red-500'
      : 'bg-emerald-500';

  const healthTitle = healthLoading
    ? 'Connecting...'
    : healthError
      ? 'Server offline'
      : 'Server connected';

  if (loading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Dropdown
      items={[
        {
          type: 'custom',
          content: (
            <div className="border-border border-b px-4 py-3">
              {user.fullName && (
                <p className="text-text-primary truncate text-sm font-medium">
                  {user.fullName}
                </p>
              )}
              <p className="text-text-secondary truncate text-xs">
                {user.email}
              </p>
            </div>
          ),
        },
        {
          icon: <UserIcon />,
          label: 'Profile',
          onClick: () => navigate('/profile'),
        },
        {
          icon: <SparklesIcon />,
          label: "What's New",
          onClick: onOpenWhatsNew,
        },
        {
          icon: <LogOutIcon />,
          label: 'Log out',
          variant: 'danger',
          onClick: signOut,
        },
      ]}
      trigger={
        <div className="relative">
          <button aria-label="User menu" className="rounded-full">
            <Avatar
              {...getAvatarData(user)}
              className="hover:bg-brand-600 cursor-pointer transition-colors"
              size="md"
            />
          </button>
          <span
            className={`dark:border-bg-surface absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white ${healthDotClass}`}
            title={healthTitle}
          />
        </div>
      }
    />
  );
}
