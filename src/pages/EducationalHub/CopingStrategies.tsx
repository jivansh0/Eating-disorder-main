import React from 'react';

const CopingStrategies: React.FC = () => {
  const videos = [
    {
      url: 'https://www.youtube.com/watch?v=Cv2DJ9riXb4',
      id: 'Cv2DJ9riXb4',
      title: '5 Healthy Coping Strategies for Anxiety'
    },
    {
      url: 'https://www.youtube.com/watch?v=PcKyBMGYWO4',
      id: 'PcKyBMGYWO4',
      title: 'Mindfulness Techniques for Stress Relief'
    },
    {
      url: 'https://www.youtube.com/watch?v=cPoqxmaEhL4',
      id: 'cPoqxmaEhL4',
      title: 'Emotional Regulation Skills'
    },
    {
      url: 'https://www.youtube.com/watch?v=aexBCHZxjvw',
      id: 'aexBCHZxjvw',
      title: 'Coping with Difficult Emotions'
    },
    {
      url: 'https://www.youtube.com/watch?v=HjF1AeTeN20',
      id: 'HjF1AeTeN20',
      title: 'Grounding Techniques for Triggers'
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Healthy Coping Strategies</h2>
      <p className="mb-6">
        Techniques for managing triggers, stress, and difficult emotions without resorting to ED behaviors.
      </p>

      {/* MP3 Section */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-xl font-medium mb-2">Audio: Shiv Shakti Energy Balance</h3>
        <audio controls className="w-full">
          <source src="/Music/Shivji.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <a
            key={index}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative pt-[56.25%]">
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

export default CopingStrategies;
