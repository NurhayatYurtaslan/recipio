export function Footer() {
    return (
        <footer className="py-6 mt-12 border-t">
            <div className="container mx-auto text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Recipio. All rights reserved.</p>
            </div>
        </footer>
    );
}
