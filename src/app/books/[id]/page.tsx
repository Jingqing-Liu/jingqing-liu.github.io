import { notFound } from 'next/navigation';
import { books } from '../../../data/reading';
import BookDetail from '../../../components/BookDetail';

export const dynamicParams = false;

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = books.find((item) => item.id === id);
  if (!book) notFound();
  return <BookDetail book={book} />;
}
