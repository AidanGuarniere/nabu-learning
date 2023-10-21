export enum OpenAIModel {
    DAVINCI_TURBO = "gpt-3.5-turbo"
  }
  
  export type Document = {
    fileName: string;
    author: string;
    date: string;
    content: string;
    length: number;
    tokens: number;
    chunks: DocumentChunk[];
  };
  
  export type DocumentChunk = {
    page: number;
    document_date: string;
    content: string;
    content_length: number;
    content_tokens: number;
    embedding: number[];
  };
  
  export type DocumentJSON = {
    current_date: string;
    length: number;
    tokens: number;
    documents: Document[];
  };