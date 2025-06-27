import React, { useEffect, useRef } from 'react';
import { createPlayground } from 'livecodes';
import type { Config, EmbedOptions } from 'livecodes';

const temp = `
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>You clicked {count} times.</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>

      <p>You clicked {count} times.</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>

    </div>
  );
}
export default App;
`

const config: Config = {
  markup: {
    language: 'markdown',
    content: '',
  },
  style: {
    language: 'css',
    content: 'body { color: blue; }',
  },
  script: {
    language: 'jsx',
    content: temp,
  },
  activeEditor: 'script',
};

const embedOptions: EmbedOptions = {
  // merge your normal config + add lite mode here
  config: {
    ...config,
    // mode: 'lite',
    view: 'result'
  },
  params: { console: 'none' },
};

export default function About() {
  const refs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  useEffect(() => {
    refs.forEach(r => {
      if (r.current) {
        createPlayground(r.current, embedOptions);
      }
    });
  }, []);

  const style: React.CSSProperties = {
    height: 300,
    width: '100%',
    marginBottom: 20,
  };

  return (
    <>
      <div ref={refs[0]} style={style} />
      <div ref={refs[1]} style={style} />
      <div ref={refs[2]} style={style} />
    </>
  );
}
