import React, { useEffect, useRef } from 'react';
import { createPlayground } from 'livecodes';
import type { Config, EmbedOptions } from 'livecodes';

const temp = `
import React from 'react';

const HeroSection = () => (
  <>
    <style>{\`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      .hero {
        position: relative;
        height: 100vh;
        background: url('https://source.unsplash.com/1600x900/?nature,water') center/cover no-repeat;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: #fff;
      }
      .hero::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1;
      }
      .hero-content {
        position: relative;
        z-index: 2;
        max-width: 800px;
        padding: 20px;
      }
      .hero-content h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
        letter-spacing: 1px;
      }
      .hero-content p {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        line-height: 1.5;
      }
      .hero-content a {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: #ff6b6b;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
        transition: background 0.3s ease;
      }
      .hero-content a:hover {
        background: #ff4757;
      }
      @media (max-width: 768px) {
        .hero-content h1 {
          font-size: 2.5rem;
        }
        .hero-content p {
          font-size: 1rem;
        }
      }
    \`}</style>

    <section className="hero">
      <div className="hero-content">
        <h1>Elevate Your Experience</h1>
        <p>Discover cutting-edge solutions that empower your business and inspire innovation.</p>
        <a href="#features">Learn More</a>
      </div>
    </section>
  </>
);

export default HeroSection;
`;

const config: Partial<Config> = {
  markup:  { language: 'markdown', content: '' },
  style:   { language: 'css',    content: 'body { color: blue; }' },
  script:  { language: 'jsx',    content: temp },
  activeEditor: 'script',
  view: 'result',
  mode: 'lite',
};

const embedOptions: EmbedOptions = {
  config,
  params: {
    console: 'none',
  },
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
