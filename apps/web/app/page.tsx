import { redirect } from 'next/navigation';

export default function Home() {
    // Redirect to AI Context page by default
    redirect('/ai-context');
}