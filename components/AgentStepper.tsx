
import React from 'react';
import { Agent, AgentStatus } from '../types';
import CheckIcon from './icons/CheckIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface AgentStepperProps {
  agents: Agent[];
  currentAgentIndex: number;
  onSelectAgent: (index: number) => void;
  isProcessing: boolean;
}

const getStatusIcon = (status: AgentStatus, isCurrent: boolean, isProcessing: boolean) => {
  if (status === AgentStatus.COMPLETED) {
    return <CheckIcon className="w-5 h-5 text-green-400" />;
  }
  if (isCurrent && isProcessing) {
    return <SpinnerIcon className="w-5 h-5 text-blue-400" />;
  }
  if (status === AgentStatus.ACTIVE) {
    return <ChevronRightIcon className="w-5 h-5 text-blue-400" />;
  }
  return <div className="w-5 h-5 border-2 border-gray-500 rounded-full" />;
};

const AgentStepper: React.FC<AgentStepperProps> = ({ agents, currentAgentIndex, onSelectAgent, isProcessing }) => {
  return (
    <nav className="space-y-1" aria-label="Sidebar">
      {agents.map((agent, index) => {
        const isCurrent = index === currentAgentIndex;
        const isCompleted = agent.status === AgentStatus.COMPLETED;
        
        let textColor = 'text-gray-400 hover:text-white';
        if(isCurrent) textColor = 'text-white font-semibold';
        if(isCompleted) textColor = 'text-gray-300';

        let bgColor = 'hover:bg-gray-700';
        if (isCurrent) bgColor = 'bg-gray-700/50';

        return (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(index)}
            className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150 ${bgColor}`}
            disabled={agent.status === AgentStatus.PENDING && !isCurrent}
          >
            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full mr-3 bg-gray-800 ring-1 ring-gray-700">
              {getStatusIcon(agent.status, isCurrent, isProcessing)}
            </span>
            <span className={`truncate ${textColor}`}>
              {agent.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default AgentStepper;
