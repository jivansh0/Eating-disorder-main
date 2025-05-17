import React from 'react';

const NutritionBasics: React.FC = () => {
  // Array of video data
  const videos = [
    {
      url: "https://www.youtube.com/watch?v=xyQY8a-ng6g",
      thumbnail: "https://img.youtube.com/vi/xyQY8a-ng6g/mqdefault.jpg",
      title: "Understanding Eating Disorders"
    },
    {
      url: "https://www.youtube.com/results?search_query=Nutrition+Basics+for+Recovery",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg", // Default thumbnail for search results
      title: "Nutrition Basics for Recovery"
    },
    {
      url: "https://www.youtube.com/watch?v=K4Ze-Sp6aUE&t=19s",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg", // Default thumbnail for search results
      title: "Nutrition for Eating Disorder Recovery"
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Nutrition Basics for Recovery</h2>
      <p className="mb-6">Information about balanced eating, meal planning, and nutritional needs during recovery.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <div 
            key={index} 
            className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.open(video.url, "_blank")}
          >
            <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionBasics;