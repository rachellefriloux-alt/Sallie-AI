/**
 * Fetches current avatar form and customization from /api/avatar/state.
 * Use the returned avatarId for AvatarDisplay to show the design avatar.
 */

import { useState, useEffect, useCallback } from 'react';

export interface AvatarState {
  form: string;
  current_form: string;
  customization_options: string[];
  last_change?: string;
  [key: string]: unknown;
}

export function useAvatarState() {
  const [data, setData] = useState<AvatarState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const mutate = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetch('/api/avatar/state')
      .then((r) => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    mutate();
  }, [mutate]);

  const form = data?.form ?? data?.current_form ?? 'default';
  const avatarId = form === 'default' ? 'peacock_elegant' : form;

  return {
    avatarId,
    form,
    customization: data ?? {},
    isLoading,
    error,
    mutate,
  };
}
