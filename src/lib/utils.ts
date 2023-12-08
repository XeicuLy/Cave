import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 複数のクラス値を受け取り、それらをマージしてクラス名を生成する関数です。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
