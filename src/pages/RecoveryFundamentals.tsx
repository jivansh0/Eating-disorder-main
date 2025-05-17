import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// Define the structure for the video links
interface VideoLinkItem {
    videoId: string;
    title: string; // Placeholder title - User should update this
    thumbnailUrl: string;
    youtubeUrl: string;
}

// Array of video data with placeholders
const videoLinksData: VideoLinkItem[] = [
  {
    videoId: "3Bax8ijH038",
    title: "Understanding Eating Disorders: Video 1", // Placeholder - Update Title
    thumbnailUrl: "https://img.youtube.com/vi/3Bax8ijH038/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=3Bax8ijH038"
  },
  {
    videoId: "eMVyZ6Ax-74",
    title: "Understanding Eating Disorders: Video 2", // Placeholder - Update Title
    thumbnailUrl: "https://img.youtube.com/vi/eMVyZ6Ax-74/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=eMVyZ6Ax-74"
  },
  {
    videoId: "Kt1p2gLug60",
    title: "Understanding Eating Disorders: Video 3", // Placeholder - Update Title
    thumbnailUrl: "https://img.youtube.com/vi/Kt1p2gLug60/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=Kt1p2gLug60"
  },
  {
    videoId: "YPgRc0uzx5E",
    title: "Understanding Eating Disorders: Video 4", // Placeholder - Update Title
    thumbnailUrl: "https://img.youtube.com/vi/YPgRc0uzx5E/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=YPgRc0uzx5E"
  },
  {
    videoId: "MsSXh1BxLjE",
    title: "Understanding Eating Disorders: Video 5", // Placeholder - Update Title
    thumbnailUrl: "https://img.youtube.com/vi/MsSXh1BxLjE/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=MsSXh1BxLjE"
  },
  {
    videoId: "tEz2a97MASQ",
    title: "Understanding Eating Disorders: Video 6", // Placeholder - Update Title
    thumbnailUrl: "https://img.youtube.com/vi/tEz2a97MASQ/hqdefault.jpg",
    youtubeUrl: "https://www.youtube.com/watch?v=tEz2a97MASQ"
  }
];

export default function RecoveryFundamentals(): JSX.Element {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-healing-800">Understanding Eating Disorders</h2>
      <p className="text-center text-muted-foreground mb-8">Click on a video below to learn more.</p>

      {/* Grid for Video Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoLinksData.map((video) => (
          <a 
            key={video.videoId} 
            href={video.youtubeUrl} 
            target="_blank" // Open in new tab
            rel="noopener noreferrer" // Security best practice
            className="block group"
          >
            <Card className="rounded-lg shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02] bg-white h-full flex flex-col">
              <img 
                src={video.thumbnailUrl} 
                alt={`Thumbnail for ${video.title}`} // Updated alt text
                className="w-full h-40 object-cover border-b border-gray-200" // Adjusted height and added border
              />
              <CardContent className="p-4 flex-grow">
                <h3 className="text-md font-semibold text-healing-800 group-hover:text-healing-600 transition-colors duration-200">
                  {video.title} 
                </h3>
                {/* You could add descriptions here if needed */}
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}