export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x pt-10 pb-24 md:pt-16">
      <div className="mx-auto max-w-3xl text-[1rem] leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_h1]:h-display [&_h1]:mb-8 [&_h1]:text-3xl md:[&_h1]:text-4xl [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:tracking-[0.06em] [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_.note]:rounded-xl [&_.note]:bg-sand-soft [&_.note]:p-4 [&_.note]:text-sm [&_.note]:text-muted">
        {children}
      </div>
    </div>
  );
}
