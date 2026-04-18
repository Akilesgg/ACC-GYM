const TAB_IMAGES: Record<string, string> = {
  sports: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&auto=format',
  nutrition: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&auto=format',
  evolution: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&auto=format',
  profile: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&auto=format',
};

export default function TabBackground({ tab }: { tab: string }) {
  return (
    <div 
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage: `url(${TAB_IMAGES[tab] || TAB_IMAGES.sports})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'grayscale(100%) contrast(1.3)',
        opacity: 0.07,
      }}
    />
  );
}
