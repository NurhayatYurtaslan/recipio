import { Header } from '@/components/core/Header';
import { Footer } from '@/components/core/Footer';
import { Providers } from '@/components/core/Providers';
import { ProfileView } from '@/components/profile/ProfileView';

export default function ProfilePage() {
    return (
        <Providers>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                    <ProfileView />
                </main>
                <Footer />
            </div>
        </Providers>
    );
}
