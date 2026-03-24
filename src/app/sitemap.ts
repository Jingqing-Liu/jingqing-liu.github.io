import type { MetadataRoute } from 'next';
import { researchProjects } from '../data/research';
import { experienceData } from '../data/experience';

const BASE_URL = 'https://jingqing-liu.github.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE_URL}/education/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.8 },
    { url: `${BASE_URL}/research/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/experience/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ];

  const researchPages: MetadataRoute.Sitemap = researchProjects.map((project) => ({
    url: `${BASE_URL}/research/${project.id}/`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  const experiencePages: MetadataRoute.Sitemap = experienceData.map((exp) => ({
    url: `${BASE_URL}/experience/${exp.id}/`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...researchPages, ...experiencePages];
}
