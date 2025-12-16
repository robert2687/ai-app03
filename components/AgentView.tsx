import React from 'react';
import { Agent, AgentStatus } from '../types';
import CodeBlock from './CodeBlock';
import SpinnerIcon from './icons/SpinnerIcon';

interface AgentViewProps {
  agent: Agent;
  isProcessing: boolean;
}

const AgentView: React.FC<AgentViewProps> = ({ agent, isProcessing }) => {
  const isCompleted = agent.status === AgentStatus.COMPLETED;

  return (
    <div className="p-6 sm:p-8 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-white">{agent.name}</h2>
        </div>
        <p className="text-sm text-gray-400 mb-2 italic">{agent.role}</p>
        <p className="text-gray-300 mb-8 leading-relaxed">{agent.description}</p>
        
        <div className="space-y-8">
          {agent.input && (
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-200">{agent.input.title}</h3>
              <CodeBlock content={agent.input.content} language={agent.input.language} />
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg border border-dashed border-blue-500/50">
              <SpinnerIcon className="w-10 h-10 text-blue-400 mb-4" />
              <p className="text-blue-300 font-semibold">Agent is thinking...</p>
              <p className="text-sm text-gray-400">Generating output, please wait.</p>
            </div>
          )}

          {agent.output && isCompleted && (
             <div>
              <h3 className="text-xl font-semibold mb-3 text-green-400">{agent.output.title}</h3>
              <CodeBlock content={agent.output.content} language={agent.output.language} />
            </div>
          )}
        </div>
        
        {agent.id === 'deployer' && isCompleted && (
          <div className="mt-12 p-6 bg-green-900/30 border border-green-500/50 rounded-lg text-center">
            <h3 className="text-2xl font-bold text-green-300 mb-2">Project Generation Complete!</h3>
            <p className="text-gray-300">All agents have successfully completed their tasks. The application is ready for implementation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentView;
