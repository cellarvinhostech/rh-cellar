interface AnalyticsCardProps {
  title: string;
  description: string;
  buttonText: string;
  gradient: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export function AnalyticsCard({ 
  title, 
  description, 
  buttonText, 
  gradient, 
  icon,
  onClick 
}: AnalyticsCardProps) {
  return (
    <div 
      className={`${gradient} rounded-2xl p-6 text-white relative overflow-hidden cursor-pointer hover:scale-105 transition-transform`}
      onClick={onClick}
      data-testid="analytics-card"
    >
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        
        <p className="text-white/90 mb-6 leading-relaxed">
          {description}
        </p>
        
        <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors font-medium text-sm">
          {buttonText}
        </button>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-4 -mb-4" />
    </div>
  );
}