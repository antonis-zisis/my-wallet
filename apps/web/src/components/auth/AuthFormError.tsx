import { CircleAlertIcon } from '../icons';

export function AuthFormError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
      <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
