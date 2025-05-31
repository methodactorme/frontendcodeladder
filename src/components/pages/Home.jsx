import React from 'react';

export const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            Welcome to CodeLadder
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 transition-colors duration-300">
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 transition-colors duration-300">
              This project is a prototype of what I call the{' '}
              <strong className="text-blue-600 dark:text-blue-400">Dynamic Ladder</strong>.
            </p>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-400 transition-colors duration-300">
              <p>
                Ever wanted to share a list of coding questions with friends or collaborate on building 
                a problem ladder? While tools like Google Sheets or Docs can be used, they often feel 
                clunky and repetitive.
              </p>
              
              <p>
                <strong className="text-gray-900 dark:text-white">CodeLadder</strong> makes collaboration 
                easy—track questions, avoid duplicates, and enjoy a much better UI experience. Whether 
                you're studying solo or with a team, this tool helps you organize, share, and solve 
                more efficiently.
              </p>

              <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h2 className="text-lg font-semibold text-orange-800 dark:text-orange-400 mb-2">
                  Important Notes
                </h2>
                <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
                  <li>⚠️ Some operations might take a couple of seconds to respond. We recommend waiting 1–2 seconds before attempting another update.</li>
                  <li>
                    🔁 If refreshing the page doesn't work, it's likely due to a known render hosting issue. 
                    To continue using the site, please return to the homepage at{' '}
                    <a
                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                      href="https://frontendcodeladder.onrender.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      frontendcodeladder.onrender.com
                    </a>
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">
                  Contact & Support
                </h2>
                <p className="text-blue-700 dark:text-blue-300">
                  For any bugs, issues, or suggestions, feel free to reach out at{' '}
                  <a 
                    className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                    href="mailto:methodactorme@gmail.com"
                  >
                    methodactorme@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 mt-8 transition-colors duration-300">
              Happy Coding! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;