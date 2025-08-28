import React from 'react';
import Link from 'next/link';
import { researchDetails } from '../../../data/research-details';
import { researchProjects } from '../../../data/research';
import ResearchDetailClient from '@/components/ResearchDetailClient';

// Generate static params for all research project IDs
export async function generateStaticParams() {
  return researchProjects.map((project) => ({
    id: project.id,
  }));
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ResearchDetail({ params }: PageProps) {
  const { id } = await params;
  
  // Convert ID to the key format used in researchDetails
  const project = researchProjects.find(p => p.id === id);
  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">Project Not Found</h1>
          <Link 
            href="/research"
            className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            ← Back to Research
          </Link>
        </div>
      </div>
    );
  }

  // Create key for researchDetails lookup - map ID to detail key
  const idToKeyMap: { [key: string]: string } = {
    '1': 'Research-and-Testing-of-API-Calls-in-WeChat',
    '2': "Invisible-Threats-in-the-Met-Averse:-Roblox's-Security-Vulnerabilities",
    '3': 'Verification-of-Account-Balances-in-the-Bitcoin-System-Using-Merkle-Trees',
    '4': 'GUI-Development-for-Water-Network-Assessment-and-Simulation-System',
    '5': 'A-Design-of-Router-Firewall',
  };
  
  const detailKey = idToKeyMap[id];
  const detail = detailKey ? researchDetails[detailKey] : null;
  
  if (!detail) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-900 mb-4">Details Not Available</h1>
          <Link 
            href="/research"
            className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            ← Back to Research
          </Link>
        </div>
      </div>
    );
  }

  return <ResearchDetailClient detail={detail} />;
}
