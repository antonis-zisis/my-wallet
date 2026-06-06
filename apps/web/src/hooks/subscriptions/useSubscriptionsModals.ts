import { useState } from 'react';

import { Subscription } from '../../types/subscription';

export function useSubscriptionsModals() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subscriptionToEdit, setSubscriptionToEdit] =
    useState<Subscription | null>(null);
  const [subscriptionToCancel, setSubscriptionToCancel] =
    useState<Subscription | null>(null);
  const [subscriptionToResume, setSubscriptionToResume] =
    useState<Subscription | null>(null);
  const [subscriptionToDelete, setSubscriptionToDelete] =
    useState<Subscription | null>(null);

  return {
    isCreateOpen,
    onOpenCreate: () => setIsCreateOpen(true),
    onCloseCreate: () => setIsCreateOpen(false),
    subscriptionToEdit,
    onSelectForEdit: setSubscriptionToEdit,
    subscriptionToCancel,
    onSelectForCancel: setSubscriptionToCancel,
    subscriptionToResume,
    onSelectForResume: setSubscriptionToResume,
    subscriptionToDelete,
    onSelectForDelete: setSubscriptionToDelete,
  };
}
