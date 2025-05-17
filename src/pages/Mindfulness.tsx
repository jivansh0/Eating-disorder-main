import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, BookOpen, Download } from 'lucide-react';

const MindfulnessPage: React.FC = () => {
  const practices = [
    {
      id: 1,
      title: "5-Minute Breathing Exercise",
      description: "A quick mindfulness practice for moments when you need to reset and center yourself.",
      duration: "5 min",
      level: "Beginner",
      imageUrl: "https://images.pexels.com/photos/3560044/pexels-photo-3560044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      id: 2,
      title: "Body Scan Meditation",
      description: "Gradually bring awareness to each part of your body to release tension and increase presence.",
      duration: "15 min",
      level: "Intermediate",
      imageUrl: "https://images.pexels.com/photos/775417/pexels-photo-775417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      id: 3,
      title: "Loving-Kindness Meditation",
      description: "Cultivate feelings of goodwill, kindness, and warmth toward yourself and others.",
      duration: "20 min",
      level: "All Levels",
      imageUrl: "https://images.pexels.com/photos/3771836/pexels-photo-3771836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      id: 4,
      title: "Mindful Walking Practice",
      description: "Learn how to transform an ordinary walk into a mindful, present-moment experience.",
      duration: "10 min",
      level: "Beginner",
      imageUrl: "https://images.pexels.com/photos/214574/pexels-photo-214574.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      id: 5,
      title: "Stress Reduction Visualization",
      description: "Guided imagery to help you visualize a peaceful place and reduce anxiety.",
      duration: "12 min",
      level: "Intermediate",
      imageUrl: "https://images.pexels.com/photos/1028225/pexels-photo-1028225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      id: 6,
      title: "Mindful Eating Exercise",
      description: "Transform your relationship with food through this slow, intentional practice.",
      duration: "15 min",
      level: "All Levels",
      imageUrl: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];

  return (
    <div className="pt-24 pb-20">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl font-serif font-medium text-gray-900 mb-6">Mindfulness Practices</h1>
            <p className="text-xl text-gray-600 mb-8">
              Science-backed techniques for emotional balance, stress reduction, and present-moment awareness to support your recovery journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md font-medium">
                Start Today's Practice
              </button>
              <button className="px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors shadow-sm font-medium">
                View All Practices
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Practice */}
      <section className="px-4 sm:px-6 lg:px-8 mb-16 bg-secondary-50 py-16">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full lg:w-1/2"
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="https://images.pexels.com/photos/3094230/pexels-photo-3094230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                    alt="Featured mindfulness practice" 
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button className="h-16 w-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all transform hover:scale-105">
                      <Play className="h-6 w-6 text-primary-600 ml-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full lg:w-1/2"
              >
                <div className="bg-white p-8 rounded-xl shadow-sm">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-secondary-100 text-secondary-700 mb-4 inline-block">
                    Featured Practice
                  </span>
                  <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                    Guided Meditation for Anxiety Relief
                  </h2>
                  <p className="text-gray-600 mb-6">
                    This 20-minute guided meditation helps you manage anxiety through mindful breathing and body awareness techniques. 
                    Perfect for moments when you're feeling overwhelmed or stressed.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-secondary-600 mr-1" />
                      <span>20 minutes</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 text-secondary-600 mr-1" />
                      <span>Intermediate</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      Anxiety
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      Stress Relief
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      Emotional Balance
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <button className="px-6 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors shadow-md font-medium flex items-center">
                      <Play className="mr-2 h-4 w-4" />
                      <span>Begin Practice</span>
                    </button>
                    <button className="px-6 py-2 bg-white text-secondary-600 border border-secondary-600 rounded-lg hover:bg-secondary-50 transition-colors shadow-sm font-medium flex items-center">
                      <Download className="mr-2 h-4 w-4" />
                      <span>Download Audio</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* All Practices */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <h2 className="text-3xl font-serif font-medium text-gray-900">All Practices</h2>
              <div className="hidden md:block">
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>All Levels</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {practices.map((practice, index) => (
                <motion.div
                  key={practice.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <img 
                      src={practice.imageUrl} 
                      alt={practice.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center">
                      <button className="h-12 w-12 bg-white rounded-full flex items-center justify-center opacity-80 hover:opacity-100 transition-all transform hover:scale-105">
                        <Play className="h-5 w-5 text-primary-600 ml-0.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-white text-gray-700">
                        {practice.level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">
                      {practice.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {practice.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{practice.duration}</span>
                      </div>
                      <button className="text-secondary-600 hover:text-secondary-700 font-medium text-sm flex items-center">
                        <span>Begin</span>
                        <Play className="ml-1 h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <button className="px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors shadow-sm font-medium">
                Load More Practices
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MindfulnessPage;