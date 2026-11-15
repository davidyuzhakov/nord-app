import { useEffect } from 'react';
import {
  createSelector,
  type ActionCreatorWithoutPayload,
} from '@reduxjs/toolkit';
import { toast } from 'sonner';
import type { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUserError } from '@/store/reducers/userSlice';
import { clearChurchError } from '@/store/reducers/churchSlice';
import { clearSongError } from '@/store/reducers/songSlice';
import { clearProgramError } from '@/store/reducers/programSlice';

interface ErrorSource {
  selectError: (state: RootState) => string | null;
  clearError: ActionCreatorWithoutPayload;
}

const errorSources: ErrorSource[] = [
  {
    selectError: (state) => state.user.error?.messages.join('\n') ?? null,
    clearError: clearUserError,
  },
  {
    selectError: (state) => state.church.error,
    clearError: clearChurchError,
  },
  {
    selectError: (state) => state.church.inviteError,
    clearError: clearChurchError,
  },
  {
    selectError: (state) => state.song.error,
    clearError: clearSongError,
  },
  {
    selectError: (state) => state.program.error,
    clearError: clearProgramError,
  },
];

const selectErrors = createSelector(
  errorSources.map((source) => source.selectError),
  (...messages) =>
    messages.flatMap((message, index) =>
      message ? [{ message, clearError: errorSources[index].clearError }] : [],
    ),
);

export function useErrorToasts() {
  const errors = useAppSelector(selectErrors);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const clearErrors = new Set<ErrorSource['clearError']>();

    for (const { message, clearError } of errors) {
      toast.error(message);
      clearErrors.add(clearError);
    }

    for (const clearError of clearErrors) {
      dispatch(clearError());
    }
  }, [dispatch, errors]);
}
