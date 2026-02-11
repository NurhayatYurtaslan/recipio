import { ErrorView } from '@/components/core/ErrorView';

export default function NotFound() {
  return <ErrorView status={404} />;
}
