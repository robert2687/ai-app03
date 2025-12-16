
import React, { useState } from 'react';

interface CodeBlockProps {
  content: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ content, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden relative group">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700">
        <span className="text-xs font-semibold text-gray-400 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-300 hover:text-white transition-colors flex items-center"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-sm whitespace-pre-wrap overflow-x-auto">
        <code>{content.trim()}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
