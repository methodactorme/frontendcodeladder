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
          <p className="text-md text-gray-700 mb-4">
            ⚠️ Please note: Some operations might take a couple of seconds to respond. We recommend waiting 1–2 seconds before attempting another update.
          </p>
          <p className="text-md text-gray-700 mb-4">
            🔁 If refreshing the page doesn't work, it's likely due to a known render hosting issue. To continue using the site, please return to the homepage at{' '}
            <a
              className="text-blue-600 underline"
              href="https://frontendcodeladder.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://frontendcodeladder.onrender.com/
            </a>.
          </p>
          <p className="text-md text-gray-700 mb-6">
            For any bugs, issues, or suggestions, feel free to reach out at{' '}
            <a className="text-blue-600 underline" href="mailto:methodactorme@gmail.com">
              methodactorme@gmail.com
            </a>.
          </p>
          <p className="text-xl font-semibold text-blue-800 mt-8"> Happy Coding!</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
