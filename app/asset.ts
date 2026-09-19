const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string) {
  return `${basePath}${path}`;
}

export function route(path: string) {
  return `${basePath}${path}`;
}
