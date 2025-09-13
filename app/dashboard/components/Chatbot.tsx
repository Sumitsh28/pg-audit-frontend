"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ProblemItem } from "../types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, User, Loader2 } from "lucide-react";

import Draggable from "react-draggable";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatbotProps {
  problem: ProblemItem;
  onClose: () => void;
}

export default function Chatbot({ problem, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewport = useRef<HTMLDivElement>(null);
  const nodeRef = useRef(null);

  useEffect(() => {
    if (scrollViewport.current) {
      setTimeout(() => {
        scrollViewport.current!.scrollTop =
          scrollViewport.current!.scrollHeight;
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const dbUri = JSON.parse(sessionStorage.getItem("dbUri") || '""');
      const response = await axios.post("http://localhost:8000/chat-on-query", {
        db_uri: dbUri,
        query_context: {
          query: problem.query,
          execution_time_ms: problem.execution_time_ms,
          query_plan_before: problem.query_plan_before,
          calls: problem.calls,
        },
        optimization_context: problem.optimizationResult,
        chat_history: newMessages,
        user_question: input,
      });
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Sorry, I couldn't get a response. Please check the console or try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-muted px-1 py-0.5 rounded-sm" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <Draggable nodeRef={nodeRef} handle=".chatbot-header">
      <div
        ref={nodeRef}
        className="fixed bottom-4 right-4 w-full max-w-lg h-[50vh] bg-card border shadow-2xl rounded-lg flex flex-col z-50 animate-in slide-in-from-bottom-5"
      >
        <div className="p-4 border-b flex justify-between items-center bg-muted/50 rounded-t-lg flex-shrink-0 cursor-move chatbot-header">
          <div>
            <h3 className="font-bold">Ask AI About Query</h3>
            <p
              className="text-xs text-muted-foreground truncate max-w-md"
              title={problem.query}
            >
              Context: <span className="font-mono">{problem.query}</span>
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 min-h-0" viewportRef={scrollViewport}>
          <div className="p-4 space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary rounded-full text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-3 bg-secondary rounded-lg text-sm max-w-[85%] break-words">
                <p>
                  Hi! I have the full context for this query, including its
                  schema, execution plan, and optimization analysis. How can I
                  help you understand it better?
                </p>
              </div>
            </div>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="p-2 bg-primary rounded-full text-primary-foreground flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg text-sm max-w-[85%] break-words ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-secondary"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      components={MarkdownComponents}
                      remarkPlugins={[remarkGfm]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="p-2 bg-blue-600 rounded-full text-white flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary rounded-full text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-3 bg-secondary rounded-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/50 rounded-b-lg flex-shrink-0">
          <div className="relative">
            <Textarea
              placeholder="Why is this slow? Explain the JOIN condition..."
              className="pr-20"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />
            <Button
              className="absolute top-1/2 right-3 -translate-y-1/2"
              size="icon"
              onClick={handleSend}
              disabled={isLoading || input.trim() === ""}
              aria-label="Send Message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Draggable>
  );
}
