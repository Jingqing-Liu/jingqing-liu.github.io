import React from 'react';
import Link from 'next/link';
import { experienceData } from '../../../data';
import ExperienceDetailClient from './ExperienceDetailClient';

export async function generateStaticParams() {
  return experienceData.map((exp) => ({
    id: exp.id,
  }));
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExperienceDetail({ params }: PageProps) {
  const { id } = await params;
  const exp = experienceData.find((e) => e.id === id);

  if (!exp) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f2f2f7' }}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#1c1c1e] mb-4">Not Found</h1>
          <Link href="/experience" className="text-sm text-[#007aff] hover:underline">
            Back to Experience
          </Link>
        </div>
      </div>
    );
  }

  return <ExperienceDetailClient exp={exp} />;
}
