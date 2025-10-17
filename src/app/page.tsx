import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <video autoPlay loop muted playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      >
        <source
          src="https://tenor.com/view/spin-world-globe-mapping-details-gif-3270140137824791678"
          type="video/mp4"
        />
      </video>

      <div className="relative z-10 text-center">
        <Link href="/explore">
          <button className="px-8 py-4 bg-white text-black rounded-full text-lg font-semibold hover:bg-white/90 transition">
            Start Exploring
          </button>
        </Link>
      </div>
    </div>
  );
}
