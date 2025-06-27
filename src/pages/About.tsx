import React, { useEffect, useRef } from 'react';
import { createPlayground } from 'livecodes';
import type { Config, EmbedOptions } from 'livecodes';

const config: Config = {
  markup: {
    language: 'markdown',
    content: '# Hello LiveCodes!',
  },
  style: {
    language: 'css',
    content: 'body { color: blue; }',
  },
  script: {
    language: 'javascript',
    content: 'console.log("hello from JavaScript!");',
  },
  activeEditor: 'script',
};

const embedOptions: EmbedOptions = {
  // merge your normal config + add lite mode here
  config: {
    ...config,
    mode: 'lite',
  },
  params: { console: 'open' },
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
