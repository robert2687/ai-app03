import { GoogleGenAI, Tool } from "@google/genai";
import { Agent } from "../types";

const getClient = ( apiKey?: string ) =>
{
  const key = apiKey || process.env.API_KEY;
  if ( !key )
  {
    throw new Error( "API Key is missing. Please provide a valid Gemini API Key." );
  }
  return new GoogleGenAI( { apiKey: key } );
};

async function withRetry<T> ( fn: () => Promise<T>, retries = 3, delay = 2000 ): Promise<T>
{
  try
  {
    return await fn();
  } catch ( error: any )
  {
    if ( retries > 0 && ( error.status === 429 || error.status === 503 || error.message?.includes( '429' ) ) )
    {
      console.warn( `API rate limit exceeded. Retrying in ${ delay }ms...` );
      await new Promise( resolve => setTimeout( resolve, delay ) );
      return withRetry( fn, retries - 1, delay * 2 );
    }
    throw error;
  }
}

export const runAgent = async ( agent: Agent, previousContext: string, apiKey?: string ): Promise<string> =>
{
  return withRetry( async () =>
  {
    const ai = getClient( apiKey );
    const tools: Tool[] = [];

    if ( agent.tools?.includes( 'googleSearch' ) )
    {
      tools.push( { googleSearch: {} } );
    }

    const response = await ai.models.generateContent( {
      model: agent.model,
      contents: `Input Context:\n${ previousContext }\n\nTask: ${ agent.input?.content || "Proceed based on context." }`,
      config: {
        systemInstruction: agent.systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
      }
    } );

    // Extract grounding metadata if available (for Search)
    const grounding = response.candidates?.[ 0 ]?.groundingMetadata?.groundingChunks;
    let text = response.text || "No output generated.";

    if ( grounding && grounding.length > 0 )
    {
      const links = grounding
        .map( ( chunk: any ) => chunk.web?.uri )
        .filter( ( uri: string ) => uri )
        .map( ( uri: string ) => `Source: ${ uri }` )
        .join( '\n' );
      if ( links )
      {
        text += `\n\n${ links }`;
      }
    }

    return text;
  } );
};

export const chatWithGemini = async ( message: string, history: { role: string, parts: { text: string }[] }[], apiKey?: string ): Promise<string> =>
{
  return withRetry( async () =>
  {
    const ai = getClient( apiKey );
    const chat = ai.chats.create( {
      model: 'gemini-2.5-flash',
      history: history,
    } );

    const response = await chat.sendMessage( { message } );
    return response.text || "I couldn't generate a response.";
  } );
};

export const generateImage = async (
  prompt: string,
  aspectRatio: string,
  size: string,
  apiKey?: string
): Promise<string | null> =>
{
  return withRetry( async () =>
  {
    const ai = getClient( apiKey );

    // Switch to gemini-2.5-flash-image to avoid high-tier quotas.
    // Note: 'imageSize' is not supported on flash-image, so we rely on default resolution.
    // Casting config to any to avoid type errors with imageConfig
    const response = await ai.models.generateContent( {
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [ { text: prompt } ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      } as any
    } );

    for ( const part of response.candidates?.[ 0 ]?.content?.parts || [] )
    {
      if ( part.inlineData )
      {
        return `data:image/png;base64,${ part.inlineData.data }`;
      }
    }
    return null;
  } );
};
