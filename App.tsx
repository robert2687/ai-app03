
import React, { useState, useCallback, useEffect } from 'react';
import { Agent, AgentStatus } from './types';
import { AGENTS } from './constants';
import AgentStepper from './components/AgentStepper';
import AgentView from './components/AgentView';
import ChatAssistant from './components/ChatAssistant';
import ImageStudio from './components/ImageStudio';
import SpinnerIcon from './components/icons/SpinnerIcon';
import { runAgent } from './services/ai';

const getInitialAgents = (): Agent[] => {
  return AGENTS.map((agent, index) => ({
    ...agent,
    // Only the first agent has initial input
    input: index === 0 ? agent.input : null,
    output: null,
    status: index === 0 ? AgentStatus.ACTIVE : AgentStatus.PENDING,
  }));
};

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [agents, setAgents] = useState<Agent[]>(getInitialAgents);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [isWorkflowComplete, setIsWorkflowComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflow' | 'chat' | 'image'>('workflow');

  const checkApiKey = useCallback(async () => {
    try {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("Error checking API key", e);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        await checkApiKey();
    }
  };

  const completedAgentCount = agents.filter(a => a.status === AgentStatus.COMPLETED).length;

  const handleStart = () => setIsWorkflowRunning(true);

  const handleReset = useCallback(() => {
    setAgents(getInitialAgents());
    setSelectedAgentIndex(0);
    setIsProcessing(false);
    setIsWorkflowRunning(false);
    setIsWorkflowComplete(false);
  }, []);

  // Agent execution loop
  useEffect(() => {
    const runNextAgent = async () => {
      if (isWorkflowRunning && !isProcessing && completedAgentCount < agents.length) {
        const agentToRunIndex = completedAgentCount;
        const currentAgent = agents[agentToRunIndex];
        
        setIsProcessing(true);
        setSelectedAgentIndex(agentToRunIndex);

        try {
            // Determine context. If first agent, use its own input. Else use previous agent's output.
            let context = "";
            if (agentToRunIndex === 0) {
                context = currentAgent.input?.content || "";
            } else {
                const prevAgent = agents[agentToRunIndex - 1];
                context = prevAgent.output?.content || "";
            }

            const outputContent = await runAgent(currentAgent, context);

            setAgents(prevAgents => {
                const newAgents = [...prevAgents];
                
                // Update current agent to completed
                newAgents[agentToRunIndex] = {
                    ...newAgents[agentToRunIndex],
                    status: AgentStatus.COMPLETED,
                    output: {
                        title: "Agent Output",
                        content: outputContent,
                        language: 'markdown' // Default assumption
                    }
                };

                // Prepare next agent
                if (agentToRunIndex + 1 < newAgents.length) {
                    newAgents[agentToRunIndex + 1] = {
                        ...newAgents[agentToRunIndex + 1],
                        status: AgentStatus.ACTIVE,
                        input: {
                            title: "Input from previous agent",
                            content: outputContent,
                            language: 'markdown'
                        }
                    };
                }
                
                return newAgents;
            });

        } catch (error) {
            console.error("Agent failed:", error);
            // Handle error state (optional)
        } finally {
            setIsProcessing(false);
        }
      } else if (completedAgentCount === agents.length) {
        setIsWorkflowRunning(false);
        setIsWorkflowComplete(true);
      }
    };

    runNextAgent();
  }, [isWorkflowRunning, isProcessing, completedAgentCount, agents]);
  
  const handleSelectAgent = (index: number) => {
    if (index <= completedAgentCount) {
      setSelectedAgentIndex(index);
    }
  };

  const selectedAgent = agents[selectedAgentIndex];

  if (!hasApiKey) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">Agentic App Studio</h1>
                <p className="text-gray-400">Please connect your Google Cloud Project to continue.</p>
                <button 
                    onClick={handleSelectKey}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                    Connect API Key
                </button>
                <div className="mt-4">
                   <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">
                      View Billing Documentation
                   </a>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 font-sans text-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-16 flex-shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-4 space-y-6">
        <button 
            onClick={() => setActiveTab('workflow')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'workflow' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            title="Agent Workflow"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        </button>
        <button 
            onClick={() => setActiveTab('chat')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            title="Chat Assistant"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        </button>
        <button 
            onClick={() => setActiveTab('image')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'image' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
            title="Image Studio"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Workflow View */}
        {activeTab === 'workflow' && (
            <>
                {/* Workflow Sidebar */}
                <div className="w-1/4 max-w-xs bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
                    <div className="flex items-center mb-6 px-3">
                    <h1 className="text-xl font-bold text-white">Project Workflow</h1>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                    <AgentStepper 
                        agents={agents}
                        currentAgentIndex={completedAgentCount}
                        onSelectAgent={handleSelectAgent}
                        isProcessing={isProcessing}
                    />
                    </div>
                </div>

                {/* Workflow Main View */}
                <main className="flex-1 bg-gray-800/50 flex flex-col min-w-0">
                    <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800">
                    <div className="p-4 text-center h-28 flex flex-col justify-center">
                        {!isWorkflowRunning && !isWorkflowComplete && (
                        <>
                            <h2 className="text-xl font-bold text-white mb-2">Generate New Application</h2>
                            <p className="text-sm text-gray-400 mb-3">AI Agents will research, plan, and code your app.</p>
                            <button
                            onClick={handleStart}
                            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                            Start Workflow
                            </button>
                        </>
                        )}
                        {isWorkflowRunning && (
                        <div className="flex items-center justify-center">
                            <SpinnerIcon className="w-5 h-5 text-blue-400 mr-3" />
                            <p className="text-lg text-gray-300">Agents are working...</p>
                        </div>
                        )}
                        {isWorkflowComplete && (
                        <>
                            <h2 className="text-xl font-bold text-green-400 mb-2">Workflow Complete!</h2>
                            <button
                            onClick={handleReset}
                            className="px-6 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                            Start New Project
                            </button>
                        </>
                        )}
                    </div>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                    {selectedAgent && (
                        <AgentView
                        agent={selectedAgent}
                        isProcessing={isProcessing && selectedAgentIndex === completedAgentCount}
                        />
                    )}
                    </div>
                </main>
            </>
        )}

        {/* Chat View */}
        {activeTab === 'chat' && (
            <main className="flex-1 bg-gray-900">
                <ChatAssistant />
            </main>
        )}

        {/* Image View */}
        {activeTab === 'image' && (
            <main className="flex-1 bg-gray-900">
                <ImageStudio />
            </main>
        )}
      </div>
    </div>
  );
};

export default App;
