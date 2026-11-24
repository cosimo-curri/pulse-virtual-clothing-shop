import { useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const textarea = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();

  const sendMessage = () => {
    const text = input.current?.value || "";

    if (!loading && !message && text.trim()) {
      chat(text.trim());
      if (input.current) input.current.value = "";
    }
  };

  useEffect(() => {
    if (!textarea.current) return;
    if(message) {
      if(textarea.current.value === "")
        textarea.current.value += message.text;
      else
        textarea.current.value += `\n\n${message.text}`;
    }

    textarea.current.scrollTop = textarea.current.scrollHeight;
  }, [message])

  if(hidden)
    return null;

  return (
    <div className="UIContainer">
      <textarea
        ref={ textarea }
        placeholder="..."
        readOnly
      />
      
      <div id="input-container">
        <input
          placeholder="What does VCS stand for?"
          ref={ input }
          onKeyDown={(e) => {
            if(e.key === "Enter")
              sendMessage();
          }}
        />

        <button
          disabled={ loading || message }
          onClick={ sendMessage }
        >
          Go
        </button>

        <button onClick={() => setCameraZoomed(!cameraZoomed)}>Visual</button>
      </div>
    </div>
  );
};