import PortfolioDashboard from "@/components/portfolio-dashboard";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0052ff] via-[#1e40af] to-[#3730a3] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <PortfolioDashboard />
      </div>
    </div>
  );
}
