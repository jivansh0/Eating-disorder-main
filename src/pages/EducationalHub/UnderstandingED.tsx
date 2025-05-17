import React from 'react';

const UnderstandingED: React.FC = () => {
  // Array of video data
  const videos = [
    {
      url: 'https://www.youtube.com/watch?v=3Bax8ijH038',
      id: '3Bax8ijH038',
      title: 'What is an Eating Disorder?'
    },
    {
      url: 'https://www.youtube.com/watch?v=eMVyZ6Ax-74',
      id: 'eMVyZ6Ax-74',
      title: 'Understanding Anorexia Nervosa'
    },
    {
      url: 'https://www.youtube.com/watch?v=Kt1p2gLug60',
      id: 'Kt1p2gLug60',
      title: 'Bulimia Nervosa Explained'
    },
    {
      url: 'https://www.youtube.com/watch?v=YPgRc0uzx5E',
      id: 'YPgRc0uzx5E',
      title: 'Binge Eating Disorder Overview'
    },
    {
      url: 'https://www.youtube.com/watch?v=MsSXh1BxLjE',
      id: 'MsSXh1BxLjE',
      title: 'Eating Disorders: Signs and Symptoms'
    },
    {
      url: 'https://www.youtube.com/watch?v=tEz2a97MASQ',
      id: 'tEz2a97MASQ',
      title: 'Recovery from Eating Disorders'
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Understanding Eating Disorders</h2>
      <p className="mb-6">Information about different types of eating disorders, causes, and symptoms will go here.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <a 
            key={index}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
              <img 
                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`} 
                alt={video.title}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600 rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-lg">{video.title}</h3>
              <p className="text-sm text-gray-500 mt-1">Click to watch on YouTube</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default UnderstandingED;