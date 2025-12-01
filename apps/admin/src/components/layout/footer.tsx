export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="text-muted-foreground container mx-auto px-4 py-4 text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} Beach Football Tournament Admin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
