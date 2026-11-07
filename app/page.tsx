"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import F1GPTLogo from "./assets/F1-Logo.png";

const suggestedQuestions = [
  "Who has the most Formula 1 wins?",
  "Explain DRS like I'm new to F1",
  "What makes Monaco so challenging?",
  "How does the points system work?",
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 3-7.2 18-3.5-7.3L3 10.2 21 3Z" />
      <path d="M10.3 13.7 21 3" />
    </svg>
  );
}

function MessageText({ message }: { message: { parts: Array<{ type: string; text?: string }> } }) {
  return (
    <>
      {message.parts.map((part, index) =>
        part.type === "text" ? (
          <p key={index} className="message-copy">
            {part.text}
          </p>
        ) : null,
      )}
    </>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMessages([]);
        setInput("");
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [setMessages]);

  const submitMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    setInput("");
    void sendMessage({ text: trimmed });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage(input);
    }
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Link className="brand-lockup" href="/" aria-label="F1GPT home">
          <span className="brand-mark">
            <Image src={F1GPTLogo} alt="" width={49} height={49} priority />
          </span>
          <span className="brand-name">F1<span>GPT</span></span>
        </Link>

        <button className="new-chat-button" onClick={() => setMessages([])} type="button">
          <PlusIcon />
          <span>New conversation</span>
          <kbd>⌘ K</kbd>
        </button>

        <div className="sidebar-section-label">YOUR RACE ENGINEER</div>
        <div className="engineer-card">
          <span className="engineer-avatar"><SparkIcon /></span>
          <div>
            <strong>F1GPT Engineer</strong>
            <span>Ready when you are</span>
          </div>
          <span className="online-dot" aria-label="Online" />
        </div>

        <div className="sidebar-spacer" />
        <div className="season-card">
          <div className="season-card-top">
            <span className="live-dot" />
            <span>THE PADDOCK</span>
          </div>
          <strong>Every lap has a story.</strong>
          <p>Ask about the drivers, the drama, or the details behind the data.</p>
          <div className="checkered-stripe" aria-hidden="true" />
        </div>
        <div className="sidebar-footer">
          <span className="footer-status"><span className="online-dot" /> ALL SYSTEMS GO</span>
          <span>BUILT FOR THE LOVE OF RACING</span>
        </div>
      </aside>

      <section className="chat-panel">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="mobile-brand-mark">F1</span>
            <span>F1<span className="brand-red">GPT</span></span>
          </div>
          <div className="breadcrumb">
            <span className="breadcrumb-muted">F1GPT</span>
            <span className="breadcrumb-divider">/</span>
            <span>{messages.length ? "Your conversation" : "Race control"}</span>
          </div>
          <div className="topbar-right">
            <span className="model-badge"><span className="online-dot" /> AI ENGINEER</span>
            {messages.length > 0 && (
              <button
                className="clear-button"
                onClick={() => setMessages([])}
                type="button"
                title="Start a new conversation"
              >
                <PlusIcon />
                <span>New chat</span>
              </button>
            )}
          </div>
        </header>

        <div className="conversation-scroll">
          <div className={`conversation-content ${messages.length === 0 ? "conversation-empty" : ""}`}>
            {messages.length === 0 ? (
              <div className="welcome">
                <div className="eyebrow"><span className="eyebrow-line" /> YOUR FORMULA 1 COMPANION</div>
                <div className="welcome-emblem"><SparkIcon /></div>
                <h1>Welcome to<br /><span>the paddock.</span></h1>
                <p className="welcome-description">
                  From legendary rivalries to split-second strategy, ask anything about the sport we love.
                </p>
                <div className="suggestion-heading">
                  <span>GET THE CONVERSATION STARTED</span>
                  <span className="suggestion-count">01 — 04</span>
                </div>
                <div className="suggestion-grid">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      className="suggestion-card"
                      key={question}
                      onClick={() => submitMessage(question)}
                      type="button"
                      disabled={isBusy}
                    >
                      <span className="suggestion-index">0{index + 1}</span>
                      <span>{question}</span>
                      <ArrowIcon />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="messages-list" aria-live="polite">
                <div className="conversation-date"><span /> RADIO CHECK — YOU’RE ON AIR <span /></div>
                {messages.map((message) => (
                  <article className={`message-row ${message.role === "user" ? "message-user" : "message-assistant"}`} key={message.id}>
                    {message.role === "assistant" && (
                      <span className="message-avatar"><SparkIcon /></span>
                    )}
                    <div className="message-body">
                      <div className="message-meta">
                        <strong>{message.role === "user" ? "YOU" : "F1GPT ENGINEER"}</strong>
                        {message.role === "assistant" && <span className="message-live"><span className="online-dot" /> PIT WALL</span>}
                      </div>
                      <MessageText message={message} />
                    </div>
                    {message.role === "user" && <span className="user-avatar">YOU</span>}
                  </article>
                ))}
                {status === "submitted" && (
                  <div className="thinking-row">
                    <span className="message-avatar"><SparkIcon /></span>
                    <span className="thinking-label">Checking the telemetry<span className="thinking-dots"><i /><i /><i /></span></span>
                  </div>
                )}
                {error && (
                  <div className="error-banner" role="alert">
                    <strong>Radio interference.</strong> {error.message}
                  </div>
                )}
                <div ref={conversationEndRef} />
              </div>
            )}
          </div>
        </div>

        <footer className="composer-wrap">
          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              aria-label="Ask F1GPT a question"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your race engineer anything..."
              rows={1}
              disabled={isBusy}
            />
            <div className="composer-bottom">
              <span className="composer-hint">PRESS <kbd>ENTER</kbd> TO SEND <span className="hint-divider">·</span> <kbd>SHIFT + ENTER</kbd> FOR A NEW LINE</span>
              <button
                className="send-button"
                type="submit"
                disabled={!input.trim() || isBusy}
                aria-label="Send message"
              >
                {isBusy ? <span className="send-spinner" /> : <SendIcon />}
                <span>{isBusy ? "ON IT" : "SEND"}</span>
              </button>
            </div>
          </form>
          <p className="disclaimer">F1GPT can make mistakes. Always verify race stats and regulations.</p>
        </footer>
      </section>
    </main>
  );
}
