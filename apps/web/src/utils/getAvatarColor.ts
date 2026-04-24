const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-orange-500',
  'bg-lime-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-pink-500',
];

export function getAvatarColor(value: string): string {
  const key = value.trim().toLowerCase();
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(index);
    hash |= 0;
  }

  const bucket = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[bucket];
}
