import Link from 'next/link';
import { OoaPreview } from '@/components/ooa-preview';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-6">
      <div>
        <p className="text-sm font-mono text-blue-600 mb-3">OOA / WEB COMPONENTS</p>
        <h1 className="text-4xl font-bold mb-4">One component system. No framework lock-in.</h1>
        <p>
        You can open{' '}
        <Link href="/docs" className="font-medium underline">
          /docs
        </Link>{' '}
        and see the documentation.
        </p>
      </div>
      <OoaPreview />
    </div>
  );
}
