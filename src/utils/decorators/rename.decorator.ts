import { Transform } from 'class-transformer';

/**
 * Custom decorator for renaming fields during serialization
 * @param targetKey The key to map the value from
 */
export function Rename(targetKey: string) {
  return Transform(({ obj }) => obj[targetKey], { toClassOnly: true });
}
