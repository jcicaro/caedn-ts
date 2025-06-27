import React, { useEffect, useRef } from 'react';
import { createPlayground, PlaygroundConfig } from 'livecodes';

const config: PlaygroundConfig = {
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

export default function About() {
  const container1Ref = useRef<HTMLDivElement>(null);
  const container2Ref = useRef<HTMLDivElement>(null);
  const container3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    [container1Ref, container2Ref, container3Ref].forEach((ref) => {
      if (ref.current) {
        createPlayground(ref.current, {
          config,
          params: { console: 'open' },
        });
      }
    });
  }, []);

  const containerStyle = {
    height: 300,
    width: '100%',
    marginBottom: 20,
  } as const;

  return (
    <>
      <div ref={container1Ref} style={containerStyle} />
      <div ref={container2Ref} style={containerStyle} />
      <div ref={container3Ref} style={containerStyle} />
    </>
  );
}
