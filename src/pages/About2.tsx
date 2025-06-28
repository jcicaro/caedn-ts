// import LiveCodes, { type Props } from 'livecodes/react';

// const options: Props = {
//   config: {
//     // no markdown in this example
//     markup:  { language: 'markdown', content: '' },
//     // any global CSS you want applied inside the sandbox
//     style:   { language: 'css', content: 'body { color: blue; }' },
//     // React code to run in the sandbox
//     script:  {
//       language: 'jsx',
//       content: `
// import React from 'react';

// const HeroSection = () => (
//   <>
//     <style>{\`
//       * { margin: 0; padding: 0; box-sizing: border-box; }
//       .hero {
//         position: relative;
//         height: 100vh;
//         background: url('https://source.unsplash.com/1600x900/?nature,water') center/cover no-repeat;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         text-align: center;
//         color: #fff;
//       }
//       .hero::before {
//         content: '';
//         position: absolute;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background: rgba(0, 0, 0, 0.5);
//         z-index: 1;
//       }
//       .hero-content {
//         position: relative;
//         z-index: 2;
//         max-width: 800px;
//         padding: 20px;
//       }
//       .hero-content h1 {
//         font-size: 3rem;
//         margin-bottom: 1rem;
//         letter-spacing: 1px;
//       }
//       .hero-content p {
//         font-size: 1.25rem;
//         margin-bottom: 2rem;
//         line-height: 1.5;
//       }
//       .hero-content a {
//         display: inline-block;
//         padding: 0.75rem 1.5rem;
//         background: #ff6b6b;
//         color: #fff;
//         text-decoration: none;
//         border-radius: 4px;
//         font-weight: bold;
//         transition: background 0.3s ease;
//       }
//       .hero-content a:hover {
//         background: #ff4757;
//       }
//       @media (max-width: 768px) {
//         .hero-content h1 {
//           font-size: 2.5rem;
//         }
//         .hero-content p {
//           font-size: 1rem;
//         }
//       }
//     \`}</style>

//     <section className="hero">
//       <div className="hero-content">
//         <h1>Elevate Your Experience</h1>
//         <p>Discover cutting-edge solutions that empower your business and inspire innovation.</p>
//         <a href="#features">Learn More</a>
//       </div>
//     </section>
//   </>
// );

// export default HeroSection;
//       `
//     },
//     activeEditor: 'script',
//     view: 'result',
//     mode: 'lite',
//   },
//   params: {
//     console: 'none',
//   },
// };

// const Playground = () => (
//   <div style={{ height: '90vh', width: '100%' }}>
//     <LiveCodes {...options} style={{ height: '90%', width: '100%' }} />
//   </div>
// );

// export default Playground;
