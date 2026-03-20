export default function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-navy text-white/70 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="text-white font-bold text-lg font-display mb-2">
              GMC Khammam
            </div>
            <p className="text-sm">Government Medical College, Khammam</p>
            <p className="text-sm">Student Academic Tracking Portal</p>
          </div>
          <div>
            <div className="text-white font-semibold mb-2">Quick Links</div>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="/" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/announcements"
                  className="hover:text-white transition-colors"
                >
                  Announcements
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-2">Contact</div>
            <p className="text-sm">GMC Khammam, Telangana</p>
            <p className="text-sm">student.portal@gmckhammam.edu.in</p>
          </div>
        </div>
        <div className="border-t border-white/20 pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
          <span>© {year} GMC Khammam. All rights reserved.</span>
          <span>
            Built with ❤️ using{" "}
            <a
              href={utm}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
