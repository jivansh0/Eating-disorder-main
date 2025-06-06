import React from 'react';

const BodyImage: React.FC = () => {
  const videos = [
    {
      url: "https://www.youtube.com/watch?v=4zbOWNZ8cRg",
      thumbnail: "https://img.youtube.com/vi/4zbOWNZ8cRg/mqdefault.jpg",
      title: "Building Positive Body Image"
    },
    {
      url: "https://www.youtube.com/watch?v=v8l61PpjrE8",
      thumbnail: "https://img.youtube.com/vi/v8l61PpjrE8/mqdefault.jpg",
      title: "Body Image and Mental Health"
    },
    {
      url: "https://www.youtube.com/watch?v=pdjaxS4ME2A",
      thumbnail: "https://img.youtube.com/vi/pdjaxS4ME2A/mqdefault.jpg",
      title: "Overcoming Negative Body Thoughts"
    },
    {
      url: "https://www.youtube.com/watch?v=x000UUTJH7U",
      thumbnail: "https://img.youtube.com/vi/x000UUTJH7U/mqdefault.jpg",
      title: "Self-Worth and Body Acceptance"
    },
    {
      url: "https://www.youtube.com/watch?v=IgqMqtnTJeE",
      thumbnail: "https://img.youtube.com/vi/IgqMqtnTJeE/mqdefault.jpg",
      title: "Healing Body Image Issues"
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Body Image and Self-Esteem</h2>
      <p className="mb-6">Resources and exercises for improving body acceptance and building self-worth.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => window.open(video.url, "_blank")}
          >
            <div className="relative pt-[56.25%]">
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

export default BodyImage;
