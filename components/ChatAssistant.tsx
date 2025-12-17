
import React, { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../services/ai';
import { ChatMessage } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';

interface ChatAssistantProps
{
  apiKey?: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ( { apiKey } ) =>
{
  const [ messages, setMessages ] = useState<ChatMessage[]>( [] );
  const [ input, setInput ] = useState( '' );
  const [ isLoading, setIsLoading ] = useState( false );
  const messagesEndRef = useRef<HTMLDivElement>( null );

  const scrollToBottom = () =>
  {
    messagesEndRef.current?.scrollIntoView( { behavior: "smooth" } );
  };

  useEffect( scrollToBottom, [ messages ] );

  const handleSend = async () =>
  {
    if ( !input.trim() ) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages( prev => [ ...prev, userMsg ] );
    setInput( '' );
    setIsLoading( true );

    try
    {
      // Convert to Gemini history format
      const history = messages.map( m => ( {
        role: m.role,
        parts: [ { text: m.content } ]
      } ) );

      const responseText = await chatWithGemini( userMsg.content, history, apiKey );
      setMessages( prev => [ ...prev, { role: 'model', content: responseText } ] );
    } catch ( error )
    {
      console.error( error );
      setMessages( prev => [ ...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." } ] );
    } finally
    {
      setIsLoading( false );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        { messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl font-semibold">Gemini Chat Assistant</p>
            <p className="text-sm">Ask me anything about app development!</p>
          </div>
        ) }
        { messages.map( ( msg, idx ) => (
          <div key={ idx } className={ `flex ${ msg.role === 'user' ? 'justify-end' : 'justify-start' }` }>
            <div className={ `max-w-[80%] rounded-lg px-4 py-2 ${ msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700' }` }>
              <p className="whitespace-pre-wrap text-sm">{ msg.content }</p>
            </div>
          </div>
        ) ) }
        { isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg px-4 py-2 flex items-center space-x-2">
              <SpinnerIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Thinking...</span>
            </div>
          </div>
        ) }
        <div ref={ messagesEndRef } />
      </div>
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            placeholder="Type your message..."
            value={ input }
            onChange={ ( e ) => setInput( e.target.value ) }
            onKeyDown={ ( e ) => e.key === 'Enter' && !e.shiftKey && handleSend() }
          />
          <button
            onClick={ handleSend }
            disabled={ isLoading || !input.trim() }
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
