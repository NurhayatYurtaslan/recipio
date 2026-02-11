import { ErrorView } from '@/components/core/ErrorView';

export default function ForbiddenPage() {
  return <ErrorView status={403} />;
}
