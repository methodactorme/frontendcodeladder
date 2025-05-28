import React from 'react';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-6">
            Welcome to CodeLadder
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            This project is a prototype of what I call the <strong>Dynamic Ladder</strong>.
          </p>
          <p className="text-md text-gray-700 mb-4">
            Ever wanted to share a list of coding questions with friends or collaborate on building a problem ladder? 
            While tools like Google Sheets or Docs can be used, they often feel clunky and repetitive.
          </p>
          <p className="text-md text-gray-700 mb-4">
            <strong>CodeLadder</strong> makes collaboration easy—track questions, avoid duplicates, and enjoy a much better UI experience. 
            Whether you're studying solo or with a team, this tool helps you organize, share, and solve more efficiently.
          </p>
          <p className="text-md text-gray-700 mb-6">
            For any bugs, issues, or suggestions, feel free to reach out at <a className="text-blue-600 underline" href="mailto:methodactorme@gmail.com">methodactorme@gmail.com</a>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Practice Problems</h2>
            <p className="text-gray-600 mb-4">
              Access a curated collection of coding problems to enhance your skills
            </p>
            <img
              src="https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg"
              alt="Coding practice"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Track Progress</h2>
            <p className="text-gray-600 mb-4">
              Monitor your progress and see how far you've come
            </p>
            <img
              src="https://images.pexels.com/photos/7376/startup-photos.jpg"
              alt="Progress tracking"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          </div>
        </div>

        </div>
    </div>
  );
}

export default Home;
